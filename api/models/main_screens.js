'use strict';

module.exports = function (sequelize, DataTypes) {
  const main_screens = sequelize.define('main_screens', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    mainTitleName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mainScreenIcon: {
      type: DataTypes.STRING(255),
      allowNull: true
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
  }, { tableName: 'main_screens', paranoid: true });

  return main_screens;
};
