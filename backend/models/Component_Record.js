import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Component = sequelize.define('Component_Record', {
  component_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  component_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  // The Foreign Key: Which asset does this belong to?
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Nullable if the component is in storage/not installed
  }
}, { 
  tableName: 'Component_Record', 
  timestamps: false 
});

export default Component;