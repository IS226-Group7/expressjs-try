import { Sequelize } from 'sequelize';
import * as mariadb from 'mariadb';
import 'dotenv/config';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    dialectModule: mariadb,
    logging: false, // Set to console.log to debug SQL queries
    define: {
      timestamps: false // Keeps tables clean since we manually log history
    },
    dialectOptions: {
      connectTimeout: 10000 // Standard safety for MariaDB connections
    }    
  }
);

export default sequelize;