'use strict';


module.exports = function (sequelize, DataTypes) {
  const buses_locations_points = sequelize.define('buses_locations_points', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bus_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lat: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    long: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    point: {
     type: DataTypes.STRING(1000),
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
  }, { tableName: 'buses_locations_points', paranoid: true });
  return buses_locations_points;
};
