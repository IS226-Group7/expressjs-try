import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payslip_account_number: DataTypes.STRING,
  rank: DataTypes.STRING,
  last_name: DataTypes.STRING,
  first_name: DataTypes.STRING,
  middle_name: DataTypes.STRING
}, { tableName: 'User_Record', timestamps: false });