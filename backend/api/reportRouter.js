import express, { Router } from 'express';
import { 
  Asset, 
  Category, 
  Component, 
  ComponentType, 
  ComponentHistory, 
  User,
  History 
} from '../models/index.js';
import sequelize from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdminStatus } from '../helpers/admin.js';
import { Op } from 'sequelize'; // Necessary for "LIKE" queries

const router = express.Router();

router.get('/dashboard-stats', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    // 1. Distribution by Status
    const statusStats = await Asset.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('asset_id')), 'total']],
      group: ['status']
    });

    // 2. Recent Activity (Last 50 changes across the whole system)
    const recentActivity = await History.findAll({
      limit: 10,
      order: [['change_date', 'DESC']],
      include: [
        { model: Asset, attributes: ['asset_name', 'serial_number'] },
        { model: User, as: 'ModifiedBy', attributes: ['rank', 'last_name'] }
      ]
    });

    res.json({ statusStats, recentActivity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Components in stock but not in a chassis
router.get('/ghost-report', verifyToken, async (req, res) => {
  try {
    const parts = await Component.findAll({
      where: { asset_id: null },
      include: [{ model: ComponentType }]
    });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ghost manifest." });
  }
});

// GET: All issued assets and their current holders
router.get('/custody-report', verifyToken, async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { user_id: { [Op.ne]: null } },
      include: [{ model: User, attributes: ['rank', 'last_name', 'first_name'] }]
    });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch custody ledger." });
  }
});

// GET: Items marked for disposal
router.get('/ber-report', verifyToken, async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { status: 'BER' },
      include: [{ model: Category }]
    });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch BER list." });
  }
});

router.get('/category-status-breakdown', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const breakdown = await Asset.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Asset.asset_id')), 'count']
      ],
      include: [{
        model: Category,
        attributes: ['category_name']
      }],
      group: ['Category.category_id', 'Asset.status'],
      // Standardize output for easier frontend processing
      raw: true,
      nest: true 
    });

    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: "Breakdown generation failed." });
  }
});


export default router;