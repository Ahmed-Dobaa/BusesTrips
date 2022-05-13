'use strict';

const bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
  const users_settings = sequelize.define('users_settings', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lang: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    emailNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      default: 1
    },
    pushNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      default: 1
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
  }, { tableName: 'users_settings', paranoid: true });

  return users_settings;
};
