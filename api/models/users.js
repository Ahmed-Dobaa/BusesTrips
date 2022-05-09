'use strict';

const bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
  const users = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'email_unique',
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    secret: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    twoFactorAuthentication: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: true,
      default: '0'
    },
    twoFactorAuthenticationCode: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
      unique: true
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
  }, { tableName: 'users', paranoid: true });

  users.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  users.addHook('beforeCreate', (user, option) => {
    if(user.password) {
      return user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    }
  });

  users.addHook('beforeUpdate', (user) => {
    if(user.password) {
      return user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  users.addHook('beforeBulkUpdate', (user) => {
    if(user.password) {
      return user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  return users;
};
