import { UserAccountManagement, UserAccount } from "../models/index.js";

// --- HELPER: Admin Verification Logic ---
export const verifyAdminStatus = async (req, res, next) => {
  const requester = await UserAccount.findOne({
    where: { userAccount_id: req.user.userAccountId },
    include: [{ model: UserAccountManagement }] 
  });
  if (requester?.User_Account_Management?.admin_flag === 1) {
    next()
  }
  else {
    res.status(403).json({ error: "Access Denied: Administrative privileges required." });
  }
};

