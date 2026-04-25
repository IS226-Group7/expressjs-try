import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './api/authRouter.js'; 
import assetRouter from './api/assetRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// 1. Serve the API first
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);

// 2. Serve the built Frontend files
// This assumes your frontend folder is named 'frontend' and you ran build there
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 3. The SPA Catch-all
// This ensures that if you refresh the page on /dashboard, 
// Express sends index.html instead of a 404.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(3000, () => console.log('🚀 Unified Engine & Dashboard running on 3000'));