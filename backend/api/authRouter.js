import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserAccount, User, UserType, UserAccountManagement } from '../models/index.js';

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

// --- HELPER: Admin Verification Logic ---
const verifyAdminStatus = async (userId) => {
  const requester = await UserAccount.findOne({
    where: { userAccount_id: userId },
    include: [{ model: UserAccountManagement }] 
  });
  return requester?.User_Account_Management?.admin_flag === 1;
};

router.get('/users', verifyToken, async (req, res) => {
  try {
    const isAdmin = await verifyAdminStatus(req.user.id);
    if (!isAdmin) return res.status(403).json(
      { message: "ACCESS DENIED: Unauthorized elevation of privilege attempt logged" }
    );

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
router.post('/users/:id/deactivate', verifyToken, async (req, res) => {
  try {
    const isAdmin = await verifyAdminStatus(req.user.id);
    if (!isAdmin) return res.status(403).json({ message: "UNAUTHORIZED ACTION" });

    const { id } = req.params;

    if (id == req.user.id) return res.status(403).json({ message: "Cannot deactivate self" });

    // We don't delete; we set status to 'inactive' for audit trail integrity
    await UserAccount.update({ status: 'inactive' }, { where: { userAccount_id: id } });
    
    res.json({ message: `Account ${id} deactivated successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTE: RESET PASSWORD (ADMIN FORCED) ---
router.post('/users/:id/reset-password', verifyToken, async (req, res) => {
  try {
    const isAdmin = await verifyAdminStatus(req.user.id);
    if (!isAdmin) return res.status(403).json({ message: "UNAUTHORIZED ACTION" });

    const { id } = req.params;
    const { newPassword } = req.body; // Usually a temporary password like 'Reset123!'
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserAccount.update({ password: hashedPassword }, { where: { userAccount_id: id } });

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;