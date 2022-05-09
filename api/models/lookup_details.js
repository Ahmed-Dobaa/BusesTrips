'use strict';

module.exports = function (sequelize, DataTypes) {
  const lookup_details = sequelize.define('lookup_details', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    lookupDetailName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    lookupId: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, { tableName: 'lookup_details', paranoid: true });

  return lookup_details;
};
