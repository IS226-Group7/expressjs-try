import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserAccount = sequelize.define('User_Account_Record', {
  userAccount_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userType_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2 // Assuming 2 is 'Technician' or 'Staff'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, { tableName: 'User_Account_Record' });

export default UserAccount;