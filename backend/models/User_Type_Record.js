import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('User_Type_Record', {
  userType_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userType_name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT
}, { tableName: 'User_Type_Record', timestamps: false });