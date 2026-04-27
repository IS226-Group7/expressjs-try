import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log("no token");
    return res.status(403).json({ message: "No security token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // This contains the user ID and role
    console.log("user has verified token");
    next();
  } catch (err) {
    console.log("invalid token");
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};