import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORT ROUTERS 
import authRouter from './api/authRouter.js';
import assetRouter from './api/assetRouter.js';
import auditRouter from './api/auditRouter.js';
import reportRouter from './api/reportRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// 2. API ROUTES (The Engine Logic)
// These MUST come before the static files/catch-all
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);
app.use('/api/audit', auditRouter);
app.use('/api/reports', reportRouter);

// 3. STATIC FILES (The Built Frontend)
// This serves your JS, CSS, and Images from the frontend/dist folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

/**
 * 4. THE Single Page App CATCH-ALL (The Router Fix)
 * We use the regex /^(?!\/api).+/ to tell Express:
 * "If the request does NOT start with /api, send the index.html."
 * This allows React Router to handle page navigation (like /dashboard).
 */
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Engine running on http://localhost:${PORT}`);
});