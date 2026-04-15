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

// Test Route: Generate a QR Code for an Asset
app.get('/test-qr/:tag', async (req, res) => {
  const url = `https://codespace-url/scan/${req.params.tag}`;
  const qr = await QRCode.toDataURL(url);
  res.send(`<img src="${qr}">`);
});


import User from './models/User.js';
import Asset from './models/Asset.js';
import Location from './models/Location.js';

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Relationships
  Location.hasMany(Asset);
  Asset.belongsTo(Location);

  User.hasMany(Asset);
  Asset.belongsTo(User);

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
app.post('/register', async (req, res) => {
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
app.post('/login', async (req, res) => {
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
app.post('/assets', async (req, res) => {
  const asset = await Asset.create(req.body);
  res.json(asset);
});

// Add a new Location
app.post('/locations', async (req, res) => {
  const loc = await Location.create(req.body);
  res.json(loc);
});

// The "QR Scan" Route (Get Asset + Location + User)
app.get('/scan/:tag', async (req, res) => {
  const asset = await Asset.findOne({
    where: { assetTag: req.params.tag },
    include: [User, Location] // This is the "Eager Loading" magic
  });
  
  if (!asset) return res.status(404).send("Asset not found");
  res.json(asset);
});