import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('User_Account_Management', {
  userAccountManagement_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userAccount_id: { type: DataTypes.INTEGER, allowNull: false },
  app_identifier: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 or 1
  admin_flag: { type: DataTypes.INTEGER, defaultValue: 0 } // 0 or 1
}, { tableName: 'User_Account_Management', timestamps: false });