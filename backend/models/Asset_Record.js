import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asset = sequelize.define('Asset_Record', {
  asset_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_tag: {
    type: DataTypes.INTEGER, // 0 or 1
    allowNull: false
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asset_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('BER', 'Workable', 'Under Repair'),
    defaultValue: 'Workable'
  },
  // Foreign Keys (Sequelize will link these in the index file)
  category_id: DataTypes.INTEGER,
  acquisition_type_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER
}, { 
  tableName: 'Asset_Record', 
  timestamps: false 
});

export default Asset;