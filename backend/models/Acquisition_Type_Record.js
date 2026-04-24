import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AcquisitionType = sequelize.define('Acquisition_Type_Record', {
  acquisitionType_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  acquisitionType_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT
}, { 
  tableName: 'Acquisition_Type_Record', 
  timestamps: false 
});

export default AcquisitionType;