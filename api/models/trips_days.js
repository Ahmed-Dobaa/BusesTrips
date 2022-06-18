'use strict';


module.exports = function (sequelize, DataTypes) {
  const trips_days = sequelize.define('trips_days', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    day: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    to: {
      type: DataTypes.DOUBLE,
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
  }, { tableName: 'trips_days', paranoid: true });
  return trips_days;
};
