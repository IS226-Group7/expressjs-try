import 'dotenv/config';
import { sequelize } from './config/database.js';
import { seedAdmin } from './seed.js';

import express from 'express';
import serverless from 'serverless-http';
const app = express();

import cors from 'cors';

const allowedOrigins = [
  'https://is226.marlo.rocks',             // Your final production domain
  // 'https://main.d123.amplifyapp.com',   // Your Amplify preview/test domain
  'http://localhost:5173'               // Local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Required if you send Bearer tokens or cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


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
import auditRouter from './api/auditRouter.js';

app.use(express.json());

// 2. API ROUTES (The Engine Logic)
// These MUST come before the static files/catch-all
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);
app.use('/api/audit', auditRouter);

export const handler = serverless(app);