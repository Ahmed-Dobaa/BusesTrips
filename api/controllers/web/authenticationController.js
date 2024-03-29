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
      const foundCustomer = await models.customers.findOne({ where: { phoneNumber: request.payload.phoneNumber }, raw: true });

      if(!_.isEmpty(foundCustomer)) {
        await transaction.rollback();
        return Boom.notAcceptable('This mobile number alreday registered!');
      }

      const activationToken = customerService.generateActivationToken();
      payload.activationToken = activationToken;
      payload.secret = customerService.generateActivationToken();
      payload.channel= 'W';
      let createdCustomer = await models.customers.create(request.payload, {transaction});
      const userSetting = {
        customerId: createdCustomer.id,
        currency: _enum.EGY,
        lang: _enum.EN
      }
      await models.users_settings.create( userSetting, {transaction});
      // await Mailer.sendUserActivationMail(request.payload.email, activationToken);


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
      const foundCustomer = await models.customers.findOne({ where: { phoneNumber: payload.phoneNumber, channel: 'W' } });

      if(_.isEmpty(foundCustomer) || !foundCustomer.validPassword(payload.password)) {
        return Boom.unauthorized('Wrong Mobile Number Or Password')
      }

      // if(foundCustomer.active === 0) {
      //   // const response = helperService.findMessage('EmailActivation');
      //   return Boom.notAcceptable('Please, confirm your email');
      //   // return responseService.NotAllowed(reply, response.message[language]);
      // }

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

  setCustomerServiceType: async (request, reply) =>{
    let transaction;
    const { payload } = request;
     try {
      transaction = await models.sequelize.transaction();
      console.log("payload",payload);
      const customerFound = await models.customers.findAll({where: {id: request.params.customerId }});
      console.log("customerFound",customerFound);
      if(!_.isEmpty(customerFound)){
        const customerUpdated = await models.customers.update(payload, {where: {id: request.params.customerId , channel: 'W'}}, { transaction });
        await transaction.commit();
        return responseService.OK(reply, {value: customerUpdated, message: "Service type updated successfully" });
      }
      await transaction.rollback();
      return Boom.notAcceptable(`Sorry, We cannot found this customer right now!`);
    }
    catch (e) {
      console.log('Error', e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },
  addParentData: async (request, reply) =>{
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      const customer = await models.customers.update(payload, { where: { id: payload.id, channel: 'W' } });

      for(let i= 0; i < payload.childern.length; i++){
        payload.childern[i]["customerId"]= payload.id;
        if(payload.childern[i].id === null) {
          const child = await models.childs.create(payload.childern[i]);
        }else{
          const child = await models.childs.update( payload.childern[i], { where: { id: payload.childern[i].id} });
        }
      }
      await transaction.commit();
      return responseService.OK(reply, {value: customer, message: "Updated parent and childs data" });
    }
    catch (e) {
      console.log('Error', e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },
  getParentData: async (request, reply) =>{
    let language = request.headers.language;
    try {
      const customer = await models.customers.findOne({ where: { id: request.params.customerId, channel: 'W' } });

          const childs = await models.sequelize.query(`select id, name, age, pickup, school,
          (select point from points p where p.id= school) schoolName
             from childs where customerId= ${request.params.customerId}
              and deletedAt is null
      `, { type: QueryTypes.SELECT });
   console.log(childs)
           customer.dataValues["childern"] = childs;


      return responseService.OK(reply, {value: customer, message: "Parent data" });
    }
    catch (e) {
      console.log('Error', e);

      return responseService.InternalServerError(reply, e);
    }
  },

  addStudentData: async (request, reply) =>{
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      const customer = await models.customers.update(payload, { where: { id: payload.id, channel: 'W' } });


      await transaction.commit();
      return responseService.OK(reply, {value: customer, message: "Updated student data" });
    }
    catch (e) {
      console.log('Error', e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },
 
  setServiceType: async (request, reply) =>{
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      const foundCustomer = await models.customers.findOne({ where: { 'id': request.params.id } });
      await transaction.commit();
      if(_.isEmpty(foundCustomer)) {
        return Boom.notAcceptable('Wrong user');
      }
      await models.customers.update({ 'serviceType': payload.serviceType }, { where: { id: foundCustomer.id } });
      foundCustomer.serviceType = payload.serviceType;
      return responseService.OK(reply, { value: foundCustomer, message: `Update service type` });
    }
    catch (e) {
      console.log('Error', e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },
  getStudentData: async (request, reply) =>{
    let language = request.headers.language;
    try {
      const customer = await models.sequelize.query(`select id, name, phoneNumber, university, faculty, year, parentName,
              parentPhoneNumber, parentJob, pickup, subsciptionType
              from customers
              where id= ${request.params.id}
              and deletedAt is null`, { type: QueryTypes.SELECT })

      return responseService.OK(reply, {value: customer[0], message: "Student data" });
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
