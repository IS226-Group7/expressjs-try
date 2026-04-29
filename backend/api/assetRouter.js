import express, { Router } from 'express';
import { Asset, Category, Component, ComponentType, ComponentHistory, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdminStatus } from '../helpers/admin.js';
import { Op } from 'sequelize'; // Necessary for "LIKE" queries


// Import Sequelize models or DB config here

const router = express.Router();

// GET all assets with Category and User details (JOIN logic)
router.get('/', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    // Example: SELECT * FROM Asset_Record JOIN Asset_Category_Record...
    res.json({ message: "List of assets with categories" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update-status', verifyToken, verifyAdminStatus, async (req, res) => {
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

router.post('/create', verifyToken, verifyAdminStatus, async(req, res) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    const { asset_name, serial_number, category_id, status } = req.body;
    const newAsset = await Asset.create({
      asset_name: asset_name,
      serial_number: serial_number,
      category_id: category_id,
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
      include: [{ model: Category }, {model: User}] // Pull in category details automatically
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
router.post('/install-component', verifyToken, verifyAdminStatus, async (req, res) => {
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

// PUT: Assign Asset to Personnel
router.put('/assign', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const { assetId, personnelId } = req.body;
    await Asset.update(
      { user_id: personnelId }, 
      { where: { asset_id: assetId } }
    );
    res.json({ message: "Asset successfully assigned." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update custody." });
  }
});

// Fetch all personnel for the dropdown
router.get('/personnel/list', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const people = await User.findAll({ attributes: ['user_id', 'rank', 'first_name', 'last_name'] });
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch registry." });
  }
});

// PUT: Return Asset to Storage (Clear user_id)
router.put('/return-to-storage', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const { assetId } = req.body;
    await Asset.update(
      { user_id: null }, 
      { where: { asset_id: assetId } }
    );
    res.json({ message: "Asset returned to storage; custody cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear assignment." });
  }
});

// PUT: Uninstall/Harvest a component
router.put('/harvest-component', verifyToken, verifyAdminStatus, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { componentId } = req.body;
    const comp = await Component.findByPk(componentId);
    
    // 1. Log to Component_History_Record
    await ComponentHistory.create({
      component_id: comp.component_id,
      action_taken: 'HARVESTED',
      from_asset_id: comp.asset_id,
      to_asset_id: null,
      changed_by: req.user.username
    }, { transaction: t });
    
    // 2. Set asset_id to NULL in active Components
    await Component.update(
      { asset_id: null },
      { where: { component_id: componentId }, transaction: t }
    );

    await t.commit();
    res.json({ message: "Component harvested to stock." });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Harvesting failed." });
  }
});

// PUT: Relink Component (NULL -> New Link)
router.put('/relink-component', verifyToken, verifyAdminStatus, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { componentId, assetId } = req.body;

    await ComponentHistory.create({
      component_id: componentId,
      action_taken: 'RELINKED',
      from_asset_id: null,
      to_asset_id: assetId,
      changed_by: req.user.username
    }, { transaction: t });

    await Component.update(
      { asset_id: assetId },
      { where: { component_id: componentId }, transaction: t }
    );

    await t.commit();
    res.json({ message: "Component installed from stock." });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Relinking failed." });
  }
});

// DELETE: Dispose of a component and log to history
router.delete('/dispose-component/:id', verifyToken, verifyAdminStatus, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const componentId = req.params.id;

    // 1. Fetch component details for the history log
    const comp = await Component.findByPk(componentId);
    if (!comp) return res.status(404).json({ error: "Component not found." });

    // 2. Create the History Log
    await ComponentHistory.create({
      component_id: comp.component_id,
      action_taken: 'DISPOSED',
      change_date: new Date(),
      from_asset_id: comp.asset_id,
      changed_by: req.user.username
    }, { transaction: t });

    // 3. Remove from active inventory
    await Component.destroy({ 
      where: { component_id: componentId }, 
      transaction: t 
    });

    await t.commit();
    res.json({ message: "Component disposed and logged to history." });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: "Disposal protocol failed." });
  }
});

// GET: Fetch all components not currently linked to an asset
router.get('/components/available', verifyToken, verifyAdminStatus, async (req, res) => {
  try {
    const availableComponents = await Component.findAll({
      where: {
        asset_id: null // This is the key: it means the part is in stock
      },
      include: [
        {
          model: ComponentType, // Assuming your model name for component types
          attributes: ['component_type_name']
        }
      ],
    });

    res.json(availableComponents);
  } catch (err) {
    console.error("Error fetching stock:", err);
    res.status(500).json({ error: "Failed to fetch spare parts manifest." });
  }
});

export default router;