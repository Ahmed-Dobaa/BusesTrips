'use strict';


module.exports = function (sequelize, DataTypes) {
  const single_trips = sequelize.define('single_trips', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    routeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    busId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
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
  }, { tableName: 'single_trips', paranoid: true });
  return single_trips;
};
