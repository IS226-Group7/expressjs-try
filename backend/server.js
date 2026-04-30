import 'dotenv/config';
import { sequelize } from './config/database.js';
import { seedAdmin } from './seed.js';

import express from 'express';
import serverless from 'serverless-http';
const app = express();

app.get('/api/test-db', async (req, res) => {
  /*await seedAdmin();*/
  
  try {
    // A simple query to check connectivity
    await sequelize.authenticate(); 
    res.json({ status: "success", message: "Connected to MariaDB RDS!" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
  
});

// 1. IMPORT ROUTERS 
import authRouter from './api/authRouter.js';
import assetRouter from './api/assetRouter.js';

app.use(express.json());

// 2. API ROUTES (The Engine Logic)
// These MUST come before the static files/catch-all
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);

export const handler = serverless(app);