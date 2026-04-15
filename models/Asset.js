import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Asset = sequelize.define('Asset', {
  assetTag: { type: DataTypes.STRING, unique: true, allowNull: false },
  model: { type: DataTypes.STRING },
  status: { 
    type: DataTypes.ENUM('In Stock', 'Deployed', 'Repair', 'Retired'),
    defaultValue: 'In Stock'
  }
});

export default Asset;