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

export default router;