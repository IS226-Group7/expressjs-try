import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT
}, { 
  tableName: 'Asset_Category_Record', 
  timestamps: false 
});

export default Category;