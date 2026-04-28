import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('Component', {
  component_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  component_details: { type: DataTypes.STRING, allowNull: false },
  component_type_id: { type: DataTypes.INTEGER, allowNull: false },
  asset_id: { type: DataTypes.INTEGER, allowNull: true } // One-to-Many link
}, { tableName: 'Component_Record', timestamps: false });