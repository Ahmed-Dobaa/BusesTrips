'use strict';

module.exports = function (sequelize, DataTypes) {
  const role_permissions = sequelize.define('role_permissions', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    roleId: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    permissionId: {
      type: DataTypes.INTEGER(10),
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
  }, { tableName: 'role_permissions', paranoid: true });

  return role_permissions;
};
