import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LogisticalRequirement = sequelize.define('Logistical_Requirement_Record', {
  logreq_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Description of why the asset needs logistical support
  request_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // The ID of the person (User_Record) making the request
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Simplified approval logic
  approval_status: {
    type: DataTypes.ENUM('disapproved', 'approved', 'pending'),
    defaultValue: 'pending'
  },
  // The specific Asset that triggered this requirement
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  request_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { 
  tableName: 'Logistical_Requirement_Record', 
  timestamps: false 
});

export default LogisticalRequirement;