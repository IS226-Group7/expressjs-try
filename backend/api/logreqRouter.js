import express from 'express';
const router = express.Router();

// POST new request (Triggered when asset is marked BER)
router.post('/request', async (req, res) => {
  const { asset_id, requested_by } = req.body;
  try {
    // Insert into Logistical_Requirement_Record
    res.json({ message: "Logistical request created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;