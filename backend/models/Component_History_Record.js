import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComponentHistory = sequelize.define('Component_History_Record', {
  componentHistory_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  component_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action_taken: {
    type: DataTypes.STRING, // e.g., 'Installed', 'Removed', 'Repaired'
    allowNull: false
  },
  from_asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  to_asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  changed_by: DataTypes.STRING,
  change_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { 
  tableName: 'Component_History_Record', 
  timestamps: false 
});

export default ComponentHistory;