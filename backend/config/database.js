import { Sequelize } from 'sequelize';
import * as mariadb from 'mariadb';
import 'dotenv/config';

 export const sequelize = new Sequelize(
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
      ssl: {
        rejectUnauthorized: true // Set to false if you don't want to provide a specific CA cert
      }
    }    
  }
);

export default sequelize;