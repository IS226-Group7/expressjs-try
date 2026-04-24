import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Location = sequelize.define('Location', {
  name: { type: DataTypes.STRING, allowNull: false }, // e.g., "Warehouse A"
  room: { type: DataTypes.STRING }
});

export default Location;