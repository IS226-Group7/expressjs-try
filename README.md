# expressjs-implementation
### IS226 - Group 7 ITAM System
### .

# Quick-Start Guide
## Install MariaDB
```
sudo apt-get update
sudo apt-get install mariadb-server -y
sudo service mariadb start
sudo mariadb -u root
```

### Inside the MariaDB prompt, run:
SQL
```
CREATE DATABASE itam_db;
CREATE USER 'itam_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON itam_db.* TO 'itam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Install dependencies:
```
cd backend
npm install 
```
### Create an .env file in the root:
Code snippet
```
PORT=3000
DB_NAME=itam_db
DB_USER=itam_user
DB_PASS=password123
DB_HOST=localhost
JWT_SECRET=super-secret-key
```
### Go back to the project folder
`cd ..`

# for the frontend
```
cd frontend
npm install
npm run build
cd ..
```

# populate the first admin user (admin / Admin123!)
```
cd backend
node seed.js
```

# run the app with the frontend built
```
node server.js
```