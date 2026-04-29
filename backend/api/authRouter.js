import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserAccount, User, UserType, UserAccountManagement } from '../models/index.js';
import sequelize from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdminStatus } from '../helpers/admin.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const account = await UserAccount.findOne({
      where: { username, status: 'active' },
      include: [
        { model: User },
        { model: UserType },
        { model: UserAccountManagement }
      ]
    });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { 
        userAccountId: account.userAccount_id,
        role: account.User_Type_Record?.userType_name,
        isAdmin: account.User_Account_Management?.admin_flag === 1
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      user: {
        name: `${account.User.rank} ${account.User.last_name}`,
        role: account.User_Type_Record?.userType_name,
        isAdmin: account.User_Account_Management?.admin_flag === 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    // If verified, proceed to fetch the registry
    const users = await UserAccount.findAll({
      include: [{ model: User }],
      attributes: { exclude: ['password'] } // Never send hashes
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Registry Query Failed" });
  }
});

// --- ROUTE: DEACTIVATE OPERATOR ---
router.post('/users/:id/deactivate', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const { id } = req.params;

    if (id == req.user.userAccountId) return res.status(403).json({ message: "Cannot deactivate self" });

    // We don't delete; we set status to 'inactive' for audit trail integrity
    await UserAccount.update({ status: 'inactive' }, { where: { userAccount_id: id } });
    
    res.json({ message: `Account ${id} deactivated successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTE: RESET PASSWORD (ADMIN FORCED) ---
router.post('/users/:id/reset-password', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body; // Usually a temporary password like 'Reset123!'
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserAccount.update({ password: hashedPassword }, { where: { userAccount_id: id } });

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/create', verifyToken, async (req, res) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    const { firstName, lastName, rank, username, password, adminFlag } = req.body;

    // 1. Create the Human (User_Record)
    const newUser = await User.create({
      first_name: firstName,
      last_name: lastName,
      rank: rank
    }, { transaction: t });

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the Login (User_Account_Record)
    const newAccount = await UserAccount.create({
      user_id: newUser.user_id, // Link to the ID we just generated
      username: username,
      password: hashedPassword,
      status: 'active'
    }, { transaction: t });

    // 4. Set Permissions (User_Account_Management)
    await UserAccountManagement.create({
      userAccount_id: newAccount.userAccount_id,
      admin_flag: adminFlag ? 1 : 0
    }, { transaction: t });

    await t.commit(); // Save all changes
    res.json({ message: "Operator onboarded successfully." });

  } catch (err) {
    await t.rollback(); // Undo everything if any step fails
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Username already exists in the registry." });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;