'use strict';


module.exports = function (sequelize, DataTypes) {
  const trips = sequelize.define('trips', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    startPoint: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    endPoint: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    busId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    busRouteId: {
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
  }, { tableName: 'trips', paranoid: true });
  return trips;
};
