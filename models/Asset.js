import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import AssetHistory from './AssetHistory.js';

const Asset = sequelize.define('Asset', {
  assetTag: { type: DataTypes.STRING, unique: true, allowNull: false },
  model: { type: DataTypes.STRING },
  status: { 
    type: DataTypes.ENUM('In Stock', 'Deployed', 'Repair', 'Retired'),
    defaultValue: 'In Stock'
  }
});

Asset.afterBulkCreate(async (assets, options) => {
  // This creates an entry in your AssetHistory table for every new asset
  const historyEntries = assets.map(asset => ({
    AssetId: asset.id,
    action: 'Bulk Import',
    notes: `Asset initialized via file import.`
  }));
  
  // Assuming you have an AssetHistory model
  await AssetHistory.bulkCreate(historyEntries);
});

export default Asset;