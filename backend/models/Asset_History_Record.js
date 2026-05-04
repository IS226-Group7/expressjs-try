import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('History', {
  assetHistoryRecord_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER, allowNull: false },
  changed_by: DataTypes.INTEGER,
  toStatus: DataTypes.STRING,
  toPerson: DataTypes.INTEGER,
  change_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Asset_History_Record', timestamps: false });