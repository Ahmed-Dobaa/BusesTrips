'use strict';


module.exports = function (sequelize, DataTypes) {
  const student_dates = sequelize.define('student_dates', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    day: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'email_unique',
    },
    from: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    to: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
  }, { tableName: 'student_dates', paranoid: true });
  return student_dates;
};
