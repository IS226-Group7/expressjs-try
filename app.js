import express from 'express';
import sequelize from './config/db.js';
import QRCode from 'qrcode';

const app = express();
app.use(express.json());

// Test Route: Check MariaDB Connection
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send("Successfully connected to MariaDB!");
  } catch (error) {
    res.status(500).send("Connection failed: " + error.message);
  }
});

function getAppUrl(req) {
  return (req.protocol) + '://' + (req.get('x-forwarded-host') || req.get('host'));
}

// Test Route: Generate a QR Code for an Asset
app.get('/test-qr/:tag', async (req, res) => {
  const hostUrl = getAppUrl(req);
  const url = `${hostUrl}/api/scan/${req.params.tag}`;
  const qr = await QRCode.toDataURL(url);
  res.send(`<img src="${qr}">`);
});


import User from './models/User.js';
import Asset from './models/Asset.js';
import Location from './models/Location.js';
import AssetHistory from './models/AssetHistory.js';

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Relationships
  Location.hasMany(Asset);
  Asset.belongsTo(Location);

  User.hasMany(Asset);
  Asset.belongsTo(User);

  // An asset has many history entries
  Asset.hasMany(AssetHistory, { foreignKey: 'AssetId' });
  AssetHistory.belongsTo(Asset, { foreignKey: 'AssetId' });

  // Sync database (creates tables)
  await sequelize.sync({ alter: true });
  console.log("Database models synced.");
});

// Add this in app.js
app.get('/', (req, res) => {
  res.send('<h1>ITAM Backend is Live</h1><p>Database is connected and routes are ready.</p>');
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- REGISTER ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Create the user (The hook we wrote earlier hashes the password)
    const newUser = await User.create({ username, password });
    
    res.status(201).json({ message: "User created!", user: newUser.username });
  } catch (error) {
    res.status(400).json({ error: "Registration failed: " + error.message });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new Asset
app.post('/api/assets', async (req, res) => {
  const asset = await Asset.create(req.body);
  res.json(asset);
});

// Add a new Location
app.post('/api/locations', async (req, res) => {
  const loc = await Location.create(req.body);
  res.json(loc);
});



// update asset history
app.put('/api/assets/:tag/status', async (req, res) => {
  const { newStatus, notes, techName } = req.body;

  const asset = await Asset.findOne({ where: { assetTag: req.params.tag } });
  if (!asset) return res.status(404).send("Asset not found");

  const oldStatus = asset.status;

  // 1. Update the Asset
  asset.status = newStatus;
  await asset.save();

  // 2. Create the History Record
  await AssetHistory.create({
    AssetId: asset.id,
    action: 'STATUS_CHANGE',
    fromStatus: oldStatus,
    toStatus: newStatus,
    notes: notes,
    changedBy: techName
  });

  res.json({ message: "Status updated and logged", asset });
});

//view asset life story
app.get('/api/scan/:tag', async (req, res) => {
  const asset = await Asset.findOne({
    where: { assetTag: req.params.tag },
    include: [
        { model: Location },
        { model: User }, // as: 'owner' }, // Use 'as' if you defined an alias
        { 
          model: AssetHistory, 
          order: [['createdAt', 'DESC']] 
        }
      ]
  });
  res.json(asset);
});

import readXlsxFile from 'read-excel-file/node';
import fs from 'fs';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import assetSchema from './validators/assetValidator.js';
import ImportLog from './models/ImportLog.js';

app.post('/api/assets/bulk-import', upload.single('file'), async (req, res) => {
  try {
    const result = await readXlsxFile(req.file.path);
    const rows = result[0].data; 
    
    const assetsToCreate = [];
    const errors = [];

    // Skip header, loop through rows
    rows.slice(1).forEach((row, index) => {
      const rowData = {
        assetTag: row[0]?.toString().trim(),
        model:    row[1]?.toString().trim(),
        status:   row[2]?.toString().trim() || 'In Stock',
        LocationId: row[3] ? parseInt(row[3], 10) : null
      };

      // Validate the row against our schema
      const { error, value } = assetSchema.validate(rowData);

      if (error) {
        // Collect errors with the specific row number (index + 2 because of header and 0-index)
        errors.push(`Row ${index + 2}: ${error.details[0].message}`);
      } else {
        assetsToCreate.push(value);
      }
    });

    // If there are any errors, don't save anything—send the report back
    if (errors.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Import failed due to validation errors.",
        errors: errors
      });
    }

    // If we passed validation, bulk create!
    const savedAssets = await Asset.bulkCreate(assetsToCreate, { updateOnDuplicate: ['model', 'status', 'LocationId'] });

    // CREATE THE LOG ENTRY
    await ImportLog.create({
      filename: req.file.originalname,
      totalRows: savedAssets.length,
      importedBy: req.user?.username || 'System Admin', // Using your Auth info
      status: 'Completed'
    });

    fs.unlinkSync(req.file.path);
    res.json({ message: `Successfully validated and imported ${savedAssets.length} assets.` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

import path from 'path';
import { fileURLToPath } from 'url';

// These two lines are required in ES Modules to get the current folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// THE DOWNLOAD ROUTE
app.get('/api/assets/template', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'templates', 'template.xlsx');
  
  // res.download handles headers, content-type, and streaming automatically
  res.download(filePath, 'ITAM_Import_Template.xlsx', (err) => {
    if (err) {
      console.error("File download failed:", err);
      res.status(404).send("Template file not found.");
    }
  });
});

app.get('/api/logs/imports', async (req, res) => {
  const logs = await ImportLog.findAll({ order: [['createdAt', 'DESC']] });
  res.json(logs);
});

app.get('/api/assets/:tag/qr', async (req, res) => {
  try {
    const { tag } = req.params;

    // The data you want encoded in the QR. 
    // Usually, this is a URL to your frontend asset page.
    
    const hostUrl = getAppUrl(req);
    const url = `${hostUrl}/api/assets/${tag}`;

    // Generate QR code as a Data URL (Base64 string)
    const qrImage = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',  // Black dots
        light: '#FFFFFF' // White background
      }
    });

    // Send it back as an image-ready string
    res.json({ assetTag: tag, qrCode: qrImage });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

import PDFDocument from 'pdfkit';

app.get('/api/assets/generate-labels', async (req, res) => {
  try {
    // 1. Fetch assets (e.g., the last 30 imported)
    const assets = await Asset.findAll({ limit: 30, order: [['createdAt', 'DESC']] });

    // 2. Setup PDF streaming
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set headers so the browser knows it's a PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="labels.pdf"');
    doc.pipe(res);

    // 3. Label Grid Constants
    const labelWidth = 160;
    const labelHeight = 80;
    const cols = 3;
    let x = 50;
    let y = 50;

    doc.fontSize(10).text("ITAM Asset Label Sheet", { align: 'center' });
    doc.moveDown();

    // 4. Generate Labels
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      
      // Generate the QR as a Buffer (better for PDFKit than Base64)
      const hostUrl = getAppUrl(req);
      const url = `${hostUrl}/api/scan/${asset.assetTag}`;
      const qrBuffer = await QRCode.toBuffer(url, { margin: 1 });

      // Draw QR Code
      doc.image(qrBuffer, x, y, { width: 60 });
      
      // Draw Text next to QR
      doc.fontSize(8).fillColor('black')
         .text(`Tag: ${asset.assetTag}`, x + 65, y + 15)
         .text(`Model: ${asset.model.substring(0, 15)}`, x + 65, y + 30);

      // Border for the label (cutting guide)
      doc.rect(x - 5, y - 5, labelWidth, labelHeight).strokeColor('#cccccc').stroke();

      // Move to next column/row
      if ((i + 1) % cols === 0) {
        x = 50;
        y += labelHeight + 10;
      } else {
        x += labelWidth + 10;
      }

      // If we hit the bottom of the page, start a new one
      if (y > 700 && i < assets.length - 1) {
        doc.addPage();
        x = 50;
        y = 50;
      }
    }

    // 5. Finalize the PDF
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
});

