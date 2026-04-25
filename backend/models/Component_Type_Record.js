import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComponentType = sequelize.define('Component_Type_Record', {
  componentType_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  componentType_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT
}, { 
  tableName: 'Component_Type_Record', 
  timestamps: false 
});

export default ComponentType;