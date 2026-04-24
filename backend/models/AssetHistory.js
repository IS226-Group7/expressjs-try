import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AssetHistory = sequelize.define('AssetHistory', {
  action: { 
    type: DataTypes.STRING, // e.g., "Status Change", "Checked Out"
    allowNull: false 
  },
  fromStatus: DataTypes.STRING,
  toStatus: DataTypes.STRING,
  notes: DataTypes.TEXT,
  changedBy: DataTypes.STRING // Username of the tech
});

export default AssetHistory;