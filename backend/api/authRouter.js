import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

// POST login - Compare plain text with hashed password
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Find user in User_Account_Record JOIN User_Record
    // 2. const match = await bcrypt.compare(password, user.password);
    res.json({ message: "Login logic goes here" });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;