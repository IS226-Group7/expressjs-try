# expressjs-try
Implement in Express JS

Quick-Start "Try Everything" Roadmap.

1. The "Sandbox" Setup
First, make sure your folder structure is ready. Run these in your terminal:

Bash
mkdir itam-backend && cd itam-backend
npm init -y
npm install express sequelize mysql2 bcrypt jsonwebtoken dotenv cookie-parser qrcode pdfkit

2. The Database Connection (config/db.js)
Create a .env file first with your MariaDB credentials, then connect:

JavaScript
import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mariadb', // or 'mysql'
  logging: false, 
});

export default sequelize;

3. Testing the "Whole Flow" (One Script)
Step A: Sync Models (Creates tables in MariaDB automatically).
Step B: Create a Test User (Hashes password via Sequelize hooks).
Step C: Auth Check (Can I log in and get a token?).
Step D: Asset Creation (Can I add a laptop with a Location?).
Step E: QR Logic (Does the scan route return the Asset + Owner + Location?).

4. Use a "REST Client" (Highly Recommended)
Testing Checklist:
POST /api/auth/register: Send a JSON body with a username/password. Check MariaDB table to see if the password is encrypted.
POST /api/auth/login: See if you get a JWT token back.
POST /api/assets: Try adding a device while sending the Token in the Authorization header.
GET /api/scan/TAG-001: Verify that the JSON response includes the Location and User objects (The "Eager Loading" we set up).