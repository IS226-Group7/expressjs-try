import express from 'express';
const router = express.Router();
// Import your Sequelize models or DB config here

// GET all assets with Category and User details (JOIN logic)
router.get('/', async (req, res) => {
  try {
    // Example: SELECT * FROM Asset_Record JOIN Asset_Category_Record...
    res.json({ message: "List of assets with categories" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status and log to Asset_History_Record
router.patch('/:id/status', async (req, res) => {
  const { fromStatus, toStatus, changed_by } = req.body;
  try {
    // 1. Update Asset_Record set status = toStatus
    // 2. Insert into Asset_History_Record
    res.json({ success: true, message: "Status updated and history logged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;