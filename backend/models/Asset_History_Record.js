import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AssetHistory = sequelize.define('Asset_History_Record', {
  assetHistoryRecord_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fromStatus: DataTypes.STRING,
  toStatus: DataTypes.STRING,
  changed_by: DataTypes.STRING, // Can store Rank + Last Name
  changeDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { 
  tableName: 'Asset_History_Record', 
  timestamps: false 
});

export default AssetHistory;