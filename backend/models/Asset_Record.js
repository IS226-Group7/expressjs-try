import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('Asset', {
  asset_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_tag: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 or 1
  serial_number: { type: DataTypes.STRING, allowNull: false },
  asset_name: { type: DataTypes.STRING, allowNull: false },
  status: { 
    type: DataTypes.ENUM('BER', 'Workable', 'Under Repair'), 
    defaultValue: 'Workable' 
  },
  category_id: DataTypes.INTEGER,
  acquisition_type_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER
}, { tableName: 'Asset_Record', timestamps: false });