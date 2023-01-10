'use strict';


module.exports = function (sequelize, DataTypes) {
  const buses_locations = sequelize.define('buses_locations', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    routeName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startPoint: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endPoint: {
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
  }, { tableName: 'buses_locations', paranoid: true });
  return buses_locations;
};
