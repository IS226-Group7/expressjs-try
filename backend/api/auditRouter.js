import express, { Router } from 'express';
import { User, History } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdminStatus } from '../helpers/admin.js';


const router = express.Router();

router.get('/asset-history/:assetId', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const history = await History.findAll({
      where: { asset_id: req.params.assetId },
      include: [
        { 
          model: User, 
          as: "ModifiedBy",
          attributes: ['first_name', 'last_name', 'rank'] 
        },
        { 
          model: User, 
          as: "Recipient",
          attributes: ['first_name', 'last_name', 'rank'] 
        },
      ],
      order: [['change_date', 'DESC']]
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Audit retrieval failed." });
  }
});

router.get('/person-history/:userId', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const history = await History.findAll({
      where: { personTo: req.params.userId },
      include: [
        {
            model: Asset,
            attributes: ['asset_name', 'serial_number']
        },
        { 
          model: User, 
          as: "ModifiedBy",
          attributes: ['first_name', 'last_name', 'rank'] 
        },
      ],
      order: [['change_date', 'DESC']]
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Audit retrieval failed." });
  }
});

router.get('/tech-history/:userId', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const history = await History.findAll({
      where: { changed_by: req.params.userId },
      include: [
        {
            model: Asset,
            attributes: ['asset_name', 'serial_number']
        },
        { 
          model: User, 
          as: "Recipient",
          attributes: ['first_name', 'last_name', 'rank'] 
        },
      ],
      order: [['change_date', 'DESC']]
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Audit retrieval failed." });
  }
});

export default router;
