'use strict';

module.exports = function (sequelize, DataTypes) {
  const permissions = sequelize.define('permissions', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    permissionName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    screenKey: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    permissionType: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    permissionChildId: {
      type: DataTypes.INTEGER(5),
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    relatedTo: {
      type: DataTypes.INTEGER(255),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
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
  }, { tableName: 'permissions', paranoid: true });

  return permissions;
};
