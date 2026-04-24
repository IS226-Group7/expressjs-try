import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our custom routers
import assetRouter from './api/assetRouter.js';
import authRouter from './api/authRouter.js';
import logreqRouter from './api/logreqRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());

// 1. Route Handlers (Separated logic)
app.use('/api/assets', assetRouter);
app.use('/api/auth', authRouter);
app.use('/api/logistics', logreqRouter);

// 2. Serve static files from the React 'dist' folder (Method 3)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 3. Catch-all: Send all other requests to React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});