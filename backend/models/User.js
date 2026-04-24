// models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('admin', 'tech', 'employee'), 
    defaultValue: 'tech' 
  }
},  {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

export default User;