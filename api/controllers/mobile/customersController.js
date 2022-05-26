'user strict';

const path = require('path');
const _ = require('lodash');
const Boom = require('boom');
const fs = require('fs');
const moment = require('moment');

const models = require(path.join(__dirname, '../../models/index'));
const Mailer = require(path.join(__dirname, '../../services/sendEmailService'));
const userService = require(path.join(__dirname, '../../services/userService'));
const errorService = require(path.join(__dirname, '../../services/errorService'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
const helperService = require(path.join(__dirname, '../../services/helperService'));
const customerService = require(path.join(__dirname, '../../services/customerService'));
const _enum = require(path.join(__dirname, '../../services/enum'));
const { QueryTypes } = require('sequelize');

module.exports = {
  getAllCustomers: async function (request, reply) {
    let language = request.headers.language;
    try {
        const customer = await models.sequelize.query(`select id, name, email, phoneNumber,
                (select lookupDetailName from lookup_details l where l.id = active) status
                from customers
                where deletedAt is null`, { type: QueryTypes.SELECT });
      return responseService.OK(reply, { value: customer, message: `All customers` });
    } catch (error) {
      return responseService.InternalServerError(reply, error);
    }
  },

  addCustomer: async (request, reply) => {
    let language = request.headers.language;
    let transaction;
    let createdCustomer = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      if(request.payload.id === null) {
        const foundCustomer = await models.customers.findOne({ where: { email: request.payload.email }, raw: true });

        if(!_.isEmpty(foundCustomer)) {
          await transaction.rollback();
          return Boom.notAcceptable('This email alreday registered!');
        }

        const activationToken = customerService.generateActivationToken();
        payload.activationToken = activationToken;
        payload.secret = customerService.generateActivationToken();
        createdCustomer = await models.customers.create(request.payload, {transaction});
        const userSetting = {
          customerId: createdCustomer.id,
          currency: _enum.EGY,
          lang: _enum.EN
        }
        await models.users_settings.create( userSetting, {transaction});
        await Mailer.sendUserActivationMail(request.payload.email, activationToken);

      }else{
         createdCustomer = await models.customers.update(request.payload, {where: {id: request.payload.id}}, {transaction});
      }


      createdCustomer = _.omit(createdCustomer.dataValues);
      await transaction.commit();

      return responseService.OK(reply, { value: createdCustomer, message: `Customers updated successfully` });
    }
    catch (e) {
  console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return errorService.wrapError(e);
    }
  },
  deleteCustomer: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedCstomer = await models.customers.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedCstomer, message: 'This customer deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }
};
