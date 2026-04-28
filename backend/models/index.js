import sequelize from '../config/database.js';

// Import All Models
import Asset from './Asset_Record.js';
import Category from './Asset_Category_Record.js';
import AcquisitionType from './Acquisition_Type_Record.js';
import History from './Asset_History_Record.js';
import Component from './Component_Record.js';
import ComponentHistory from './Component_History_Record.js';
import User from './User_Record.js';
import UserAccount from './User_Account_Record.js';
import UserAccountManagement from './User_Account_Management.js';
import UserType from './User_Type_Record.js';
import LogisticalRequirement from './Logistical_Requirement_Record.js';
import ComponentType from './Component_Type_Record.js';

// --- ASSET ASSOCIATIONS ---

// Asset <-> Category (One-to-Many)
Category.hasMany(Asset, { foreignKey: 'category_id' });
Asset.belongsTo(Category, { foreignKey: 'category_id' });

// Asset <-> AcquisitionType (One-to-Many)
AcquisitionType.hasMany(Asset, { foreignKey: 'acquisition_type_id' });
Asset.belongsTo(AcquisitionType, { foreignKey: 'acquisition_type_id' });

// Asset <-> History (One-to-Many)
Asset.hasMany(History, { foreignKey: 'asset_id' });
History.belongsTo(Asset, { foreignKey: 'asset_id' });

// --- COMPONENT ASSOCIATIONS ---

// Asset <-> Component (One-to-Many: Asset has many components)
Asset.hasMany(Component, { foreignKey: 'asset_id' });
Component.belongsTo(Asset, { foreignKey: 'asset_id' });

// Component <-> ComponentHistory (One-to-Many)
Component.hasMany(ComponentHistory, { foreignKey: 'component_id' });
ComponentHistory.belongsTo(Component, { foreignKey: 'component_id' });

ComponentType.hasMany(Component, {foreignKey: 'component_type_id'});
Component.belongsTo(ComponentType, {foreignKey: 'component_type_id' });

// --- USER & ACCOUNT ASSOCIATIONS ---

// User <-> UserAccount (One-to-One: One person has one login)
User.hasOne(UserAccount, { foreignKey: 'user_id' });
UserAccount.belongsTo(User, { foreignKey: 'user_id' });

// UserType <-> UserAccount (One-to-Many: One role can belong to many accounts)
UserType.hasMany(UserAccount, { foreignKey: 'userType_id' });
UserAccount.belongsTo(UserType, { foreignKey: 'userType_id' });

// UserAccount <-> UserAccountManagement (One-to-One: Permissions/Admin Flag)
UserAccount.hasOne(UserAccountManagement, { foreignKey: 'userAccount_id' });
UserAccountManagement.belongsTo(UserAccount, { foreignKey: 'userAccount_id' });

// --- LOGISTICS ASSOCIATIONS ---

// User <-> LogisticalRequirement (One-to-Many: User makes many requests)
User.hasMany(LogisticalRequirement, { foreignKey: 'requested_by' });
LogisticalRequirement.belongsTo(User, { foreignKey: 'requested_by', as: 'Requester' });

User.hasMany(Asset, {foreignKey: 'user_id'});
Asset.belongsTo(User, {foreignKey: 'user_id'});

export {
  sequelize,
  Asset,
  Category,
  AcquisitionType,
  History,
  Component,
  ComponentHistory,
  User,
  UserAccount,
  UserAccountManagement,
  UserType,
  ComponentType,
  LogisticalRequirement
};