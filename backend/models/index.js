import Asset from './Asset_Record.js';
import Category from './Asset_Category_Record.js';
import User from './User_Record.js';
import History from './Asset_History_Record.js';

// Asset belongs to Category
Category.hasMany(Asset, { foreignKey: 'category_id' });
Asset.belongsTo(Category, { foreignKey: 'category_id' });

// Asset has many History Records
Asset.hasMany(History, { foreignKey: 'asset_id' });
History.belongsTo(Asset, { foreignKey: 'asset_id' });

// User has many Assets
User.hasMany(Asset, { foreignKey: 'user_id' });
Asset.belongsTo(User, { foreignKey: 'user_id' });

// Asset <-> Acquisition Type
AcquisitionType.hasMany(Asset, { foreignKey: 'acquisition_type_id' });
Asset.belongsTo(AcquisitionType, { foreignKey: 'acquisition_type_id' });

// One-to-Many Relationship
Asset.hasMany(Component, { foreignKey: 'asset_id' });
Component.belongsTo(Asset, { foreignKey: 'asset_id' });

export { Asset, Category, User, History };