'use strict';


module.exports = function (sequelize, DataTypes) {
  const buses = sequelize.define('buses', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    busType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    seatsStructure: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    busPlateNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    busSeatsNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, { tableName: 'buses', paranoid: true });
  return buses;
};
