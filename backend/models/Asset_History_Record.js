import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('AssetHistory', {
  assetHistoryRecord_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER, allowNull: false },
  changed_by: DataTypes.STRING,
  fromStatus: DataTypes.STRING,
  toStatus: DataTypes.STRING,
  change_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Asset_History_Record', timestamps: false });