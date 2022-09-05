'use strict';

const bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
  const customers = sequelize.define('customers', {
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
    channel: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'email_unique',
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    secret: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
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
  }, { tableName: 'customers', paranoid: true });

  customers.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  customers.addHook('beforeCreate', (customer, option) => {
    if(customer.password) {
      return customer.password = bcrypt.hashSync(customer.password, bcrypt.genSaltSync(10));
    }
  });

  customers.addHook('beforeUpdate', (customer) => {
    if(customer.password) {
      return customer.password = bcrypt.hashSync(customer.password, bcrypt.genSaltSync(10), null);
    }
  });

  customers.addHook('beforeBulkUpdate', (customer) => {
    if(customer.password) {
      return customer.password = bcrypt.hashSync(customer.password, bcrypt.genSaltSync(10), null);
    }
  });

  // users.associate = function (models) {
  //   users.belongsTo(models.roles, { as: 'userRole', foreignKey: 'role', targetKey: 'id' });
  // };

  return customers;
};
