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

5. Install MariaDB in the Codespace
By default, Codespaces runs on Linux (Ubuntu).

Update the package manager:
sudo apt-get update

Install MariaDB:
sudo apt-get install mariadb-server -y

Start the service:
sudo service mariadb start

Secure it (press Enter for no password initially):
sudo mysql -u root

Inside the MariaDB prompt, run:
SQL
CREATE DATABASE itam_db;
CREATE USER 'itam_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON itam_db.* TO 'itam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

6. Initialize the Node.js Project
Back in the terminal, set up your Express environment:
npm init -y

Install dependencies:
npm install express sequelize mysql2 bcrypt jsonwebtoken dotenv qrcode

Create your folder structure:
mkdir config models routes

Create an .env file in the root:
Code snippet
PORT=3000
DB_NAME=itam_db
DB_USER=itam_user
DB_PASS=password123
DB_HOST=localhost
JWT_SECRET=super-secret-key

