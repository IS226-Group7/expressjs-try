import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserRecord = sequelize.define('User_Record', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rank: DataTypes.STRING,
  last_name: DataTypes.STRING,
  first_name: DataTypes.STRING,
  middle_name: DataTypes.STRING,
  payslip_account_number: DataTypes.STRING
}, { 
  tableName: 'User_Record', 
  timestamps: false 
});

export default UserRecord;