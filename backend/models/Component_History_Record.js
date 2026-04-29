import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export default sequelize.define('ComponentHistory', {
  componentHistory_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  component_id: { type: DataTypes.INTEGER, allowNull: false },
  action_taken: DataTypes.STRING,
  from_asset_id: DataTypes.INTEGER,
  to_asset_id: DataTypes.INTEGER,
  changed_by: DataTypes.STRING,
  change_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Component_History_Record', timestamps: false });