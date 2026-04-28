import express, { Router } from 'express';
import { Asset, Category, Component, ComponentType } from '../models/index.js';
import sequelize from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize'; // Necessary for "LIKE" queries

// Import Sequelize models or DB config here

const router = express.Router();

// GET all assets with Category and User details (JOIN logic)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Example: SELECT * FROM Asset_Record JOIN Asset_Category_Record...
    res.json({ message: "List of assets with categories" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status and log to Asset_History_Record
router.patch('/:id/status', verifyToken, async (req, res) => {
  const { fromStatus, toStatus, changed_by } = req.body;
  try {
    // 1. Update Asset_Record set status = toStatus
    // 2. Insert into Asset_History_Record
    res.json({ success: true, message: "Status updated and history logged" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update-status', verifyToken, async (req, res) => {
  try {
    const { id, status } = req.body;
    await Asset.update({ status }, { where: { 'asset_id' : id } });
    res.json({ message: "Status updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all categories for the dropdown
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const categories = await Category.findAll(); // Adjust model name as per your setup
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve category records." });
  }
});

router.post('/create', verifyToken, async(req, res) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    const { assetName, serialNumber, categoryId, status } = req.body;
    const newAsset = await Asset.create({
      asset_name: assetName,
      serial_number: serialNumber,
      category_id: categoryId,
      status: status
    }, { transaction: t });

    await t.commit(); // Save all changes
    res.json({ message: "Asset entry created." });
  } catch (err) {
    await t.rollback(); // Undo everything if any step fails
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTE: SEARCH ASSETS ---
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q } = req.query; // Get the search term from the URL (?q=...)

    if (!q) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Search for an exact match on serial_number OR partial match on name
    const asset = await Asset.findOne({
      where: {
        [Op.or]: [
          { serial_number: q }, // Prioritize exact match for scanners
          { asset_name: { [Op.like]: `%${q}%` } } // Fuzzy search for manual typing
        ]
      },
      include: [{ model: Category }] // Pull in category details automatically
    });

    if (!asset) {
      return res.status(404).json({ message: "No asset matching that criteria found." });
    }

    res.json(asset);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Internal engine failure during search." });
  }
});

// POST: Install a component into an asset
router.post('/install-component', verifyToken, async (req, res) => {
  try {
    const { assetId, component_details, componentTypeId } = req.body;
    
    // Using the simplified 'Component' model
    const newComponent = await Component.create({
      asset_id: assetId, // Updated column name
      component_details: component_details,
      component_type_id: componentTypeId
      // serial_number and status removed as per new schema
    });

    res.status(201).json({ message: "Component linked.", component: newComponent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to link component to chassis." });
  }
});

// GET all component types for the dropdown
router.get('/component-types', verifyToken, async (req, res) => {
  try {
    const compoTypes = await ComponentType.findAll(); // Adjust model name as per your setup
    res.json(compoTypes);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve component type records." });
  }
});

// GET components for a specific asset
router.get('/:assetId/components', verifyToken, async (req, res) => {
  try {
    const components = await Component.findAll({
      where: { asset_id: req.params.assetId },
      include: [{ model: ComponentType }] // e.g., "Storage", "Memory"
    });
    res.json(components);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve internal manifest." });
  }
});


export default router;