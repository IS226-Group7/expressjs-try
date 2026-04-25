import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('Component_Record', {
  component_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  component_name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  asset_id: { type: DataTypes.INTEGER, allowNull: true } // One-to-Many link
}, { tableName: 'Component_Record', timestamps: false });