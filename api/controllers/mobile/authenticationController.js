'use strict';

const Boom = require('boom');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const useragent = require('useragent');
const bcrypt = require('bcryptjs');
const { resourceUsage } = require('process');

useragent(true);

const jwtService = require(path.join(__dirname, '../../services/jwtService'));
const userService = require(path.join(__dirname, '../../services/userService'));
const customerService = require(path.join(__dirname, '../../services/customerService'));
const Mailer = require(path.join(__dirname, '../../services/sendEmailService'));
const models = require(path.join(__dirname, '../../models/index'));
const errorService = require(path.join(__dirname, '../../services/errorService'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
// const helperService = require(path.join(__dirname, '../../services/helperService'));
const leftMenuService = require(path.join(__dirname, '../../services/leftMenuService'));
const _enum = require(path.join(__dirname, '../../services/enum'));
const { QueryTypes } = require('sequelize');
const permissionsController = require('./../permissionsController');

module.exports = {
  signUp: async (request, reply) => {
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      const foundCustomer = await models.customers.findOne({ where: { email: request.payload.email }, raw: true });

      if(!_.isEmpty(foundCustomer)) {
        await transaction.rollback();
        return Boom.notAcceptable('This email alreday registered!');
      }

      const activationToken = customerService.generateActivationToken();
      payload.activationToken = activationToken;
      payload.secret = customerService.generateActivationToken();
      let createdCustomer = await models.customers.create(request.payload, {transaction});
      const userSetting = {
        customerId: createdCustomer.id,
        currency: _enum.EGY,
        lang: _enum.EN
      }
      await models.users_settings.create( userSetting, {transaction});
      await Mailer.sendUserActivationMail(request.payload.email, activationToken);


      createdCustomer = _.omit(createdCustomer.dataValues);
      await transaction.commit();

      return responseService.OK(reply, { value: createdCustomer, message: `Customer registered successfully` });
    }
    catch (e) {

      if(transaction) {
        await transaction.rollback();
      }
      return errorService.wrapError(e);
    }
  },
  signIn: async function (request, reply) {
    let language = request.headers.language;
    try {

      const { payload } = request;
      const foundCustomer = await models.customers.findOne({ where: { email: payload.email } });

      if(_.isEmpty(foundCustomer) || !foundCustomer.validPassword(payload.password)) {
        return Boom.unauthorized('Wrong Email Or Password')
      }

      if(foundCustomer.active === 0) {
        // const response = helperService.findMessage('EmailActivation');
        return Boom.notAcceptable('Please, confirm your email');
        // return responseService.NotAllowed(reply, response.message[language]);
      }

      const agent = useragent.lookup(request.headers['user-agent']);
      const accessToken = jwtService.generateCustomerAccessToken({
        id: foundCustomer.id,
        name: foundCustomer.name,
        email: foundCustomer.email
      }, foundCustomer.secret, agent.toJSON());

      return reply.response({status: 200, accessToken: accessToken, userData: foundCustomer, message: "Login successfully" });
    }
    catch (e) {
      console.log('Error', e);
      return responseService.InternalServerError(reply, e);
    }
  },
  activateAccount: async (request, reply) => {
    let language = request.headers.language;
    try {
      const foundCustomer = await models.customers.findOne({ where: { 'activationToken': request.payload.activationCode } });

      if(_.isEmpty(foundCustomer)) {
        return Boom.notAcceptable('Wrong activation code');
        // return responseService.NotAllowed(reply, response.message[language]);
      }

      await models.customers.update({ 'active': _enum.ACTIVE, 'activationToken': null ,'emailVerifiedAt': new Date() }, { where: { id: foundCustomer.id } });
      return responseService.OK(reply, { value: foundCustomer, message: `Customer activated` });
    }
    catch (e) {
      console.log(e)
      return Boom.badImplementation('An internal server error occurred');
    }
  },
  deactivateUser: async (request, reply) => {
    const userId = request.auth.decoded.id;
    let transaction = null;
    try {

      transaction = await models.sequelize.transaction();
      await models.users.update({ active: 0 }, { where: { id: userId }, transaction });
      await models.user_device_token.destroy({ where: { userId: userId }, transaction });
      await transaction.commit();

      return reply.response().code(204);
    }
    catch (e) {
      console.log('Error', e);

      if(transaction) {
        await transaction.rollback();
      }

      return Boom.badImplementation('An internal server error occurred');
    }
  },

  forgetPassword: async function (request, reply) {
    const { payload } = request;
    let transaction = null;
    try {
      transaction = await models.sequelize.transaction();
      const foundCustomer = await models.customers.findOne({ where: { email: payload.email } , transaction });

      if(!_.isEmpty(foundCustomer)) {

        const forgetToken = jwtService.generateUserAccessToken({ id: foundCustomer.id, email: foundCustomer.email }, foundCustomer.secret);
        await Mailer.sendCustomerForgetPasswordMail(payload.email, forgetToken);
        await transaction.commit();
        return responseService.OK(reply, { value: foundCustomer, message: 'Please, check your email' });
      }
      await transaction.rollback();
      return Boom.notAcceptable('This email is not exist');
    }
    catch (e) {
      if(transaction) {
        transaction.rollback();
      }
      throw Boom.notImplemented(e);
    }
  },
  resetPassword: async function(request, reply) {
    let transaction = null;
    try {
      transaction = await models.sequelize.transaction();
    const customer =  await models.customers.findOne({ where : {secret: request.payload.secret_code }});

    if(customer){
      const newPassword = bcrypt.hashSync(request.payload.password, bcrypt.genSaltSync(10));
      await models.customers.update({password: newPassword}, { where : {secret: request.payload.secret_code }, transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: customer, message: 'Password reset successfully' });
    }
      await transaction.rollback();
      return Boom.notAcceptable(`This secret code is invalid`);

    } catch (error) {

      if(transaction){
        await transaction.rollback();
        return Boom.badImplementation('An internal server error occurred');
      }
    }
  },
  changePassword: async function (request, reply) {
    let transaction = null;
    try {

      transaction = await models.sequelize.transaction();
      await models.users.update({ password: request.payload.password }, { where: { id: request.auth.decoded.id }, transaction });
      await models.userForgetPassword.destroy({ where: { userId: request.auth.decoded.id }, transaction });

      if(request.payload.logout) {

        await models.user_device_token.destroy({ where: { userId: request.auth.decoded.id }, transaction });
      }
      await transaction.commit();
      await Mailer.sendPasswordChangedMail(request.auth.decoded.email);


      return reply.response().code(204);
    }
    catch (e) {
      console.log('error', e);

      if(transaction) {
        await transaction.rollback();
      }
      throw Boom.notImplemented(e);
    }
  },
  logout: async function (request, reply) {
    try {

      await userService.logout(request.payload.accessToken);

      return reply.response().code(204);
    }
    catch (e) {
      console.log('error', e);
      throw Boom.notImplemented(e);
    }
  },
  resentActivationMail: async function (request, reply) {
    try {

      const foundUser = await models.users.findOne({ where: { email: request.payload.email }, raw: true });

      if(_.isEmpty(foundUser)) {
        return reply.response({"status": 406,"message": "This email is not exist"}).code(406);
        // return Boom.unauthorized('This User Not Exist');
      }

      if(! foundUser.activationToken && foundUser.active === 1) {
        return reply.response({"status": 406,"message": "This account activated before"}).code(406);
        // return Boom.unauthorized('This account activated before');
      }
      const validToken = userService.generateActivationToken();
      await models.users.update({ activationToken: validToken }, { where: { id: foundUser.id } });

      Mailer.sendUserActivationMail(request.payload.email, validToken);

      return reply.response({"status": 200, "message": "Activation code sent, please check your email"}).code(200);
    }
    catch (e) {
      console.log('error', e);

      return errorService.wrapError(e);
    }
  }
};
