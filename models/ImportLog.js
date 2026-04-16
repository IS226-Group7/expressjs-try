import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ImportLog = sequelize.define('ImportLog', {
  filename: { type: DataTypes.STRING, allowNull: false },
  totalRows: { type: DataTypes.INTEGER, allowNull: false },
  importedBy: { type: DataTypes.STRING }, // Store the technician's username
  status: { type: DataTypes.STRING, defaultValue: 'Success' }
});

export default ImportLog;