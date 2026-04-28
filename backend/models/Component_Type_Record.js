import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComponentType = sequelize.define('ComponentType', {
  component_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  component_type_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT
}, { 
  tableName: 'Component_Type_Record', 
  timestamps: false 
});

export default ComponentType;