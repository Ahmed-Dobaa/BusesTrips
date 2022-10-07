'use strict';


module.exports = function (sequelize, DataTypes) {
  const points = sequelize.define('points', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tripType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    main: {
      type: DataTypes.INTEGER,
      allowNull: true,
      default: 0
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
  }, { tableName: 'points', paranoid: true });
  return points;
};
