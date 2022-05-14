'use strict';

const Boom = require('boom');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const useragent = require('useragent');
const bcrypt = require('bcryptjs');

useragent(true);

const jwtService = require(path.join(__dirname, '../services/jwtService'));
const userService = require(path.join(__dirname, '../services/userService'));
const Mailer = require(path.join(__dirname, '../services/sendEmailService'));
const models = require(path.join(__dirname, '../models/index'));
const errorService = require(path.join(__dirname, '../services/errorService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const _enum = require(path.join(__dirname, '../services/enum'));
const leftMenuService = require(path.join(__dirname, '../services/leftMenuService'));
const permissionsController = require('./permissionsController');

module.exports = {
  registerAdmin: async (request, reply) => {
    let transaction;
    try {
      let company = null;
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      const foundUser = await models.users.findOne({ where: { email: request.payload.email }, raw: true });

      if(!_.isEmpty(foundUser)) {
        await transaction.rollback();
        return Boom.notAcceptable('This email alreday registered!');
      }

      const activationToken = userService.generateActivationToken();
      payload.activationToken = activationToken;
      payload.secret = userService.generateActivationToken();
      if(payload['role']){
        payload.status = _enum.APPROVED;
      }else{
        company = await models.companies.create(request.payload, {transaction})
        payload['role'] = _enum.COMPANY;
        payload['companyId'] = company.id;
      }
      let createdUser = await models.users.create(request.payload, {transaction});
      const privateAttributes = ['password', 'activationToken', 'secret', 'country'];

      createdUser = _.omit(createdUser.dataValues, privateAttributes);
      await Mailer.sendUserActivationMail(request.payload.email, activationToken);
      await transaction.commit();
      return responseService.OK(reply, { value: createdUser, message: `User registered successfully` });
    }
    catch (e) {
      console.log('error', e);

      return errorService.wrapError(e);
    }
  },

  activateUser: async (request, reply) => {
    try {

      const foundUser = await models.users.findOne({ where: { 'activationToken': request.payload.activationCode } });

      if(_.isEmpty(foundUser)) {
        return Boom.notAcceptable('Wrong activation code');
      }

      await models.users.update({ 'active': 1, 'activationToken': null ,'emailVerifiedAt': new Date() }, { where: { id: foundUser.id } });

      return responseService.OK(reply, { value: foundUser, message: `User activated` });
    }
    catch (e) {
      console.log('Error', e);

      return Boom.badImplementation('An internal server error occurred');
    }
  },
  login: async function (request, reply) {
    try {

      const { payload } = request;
      const foundUser = await models.users.findOne({ where: { email: payload.email } });
      const leftMenu = await leftMenuService.leftMenu(foundUser);
      const userURLs = await permissionsController.getUserScreenToAccess(foundUser);
      const actions = await permissionsController.getUserActionsInPage(foundUser);

      if(_.isEmpty(foundUser) || !foundUser.validPassword(payload.password)) {
        return Boom.unauthorized('Wrong Email Or Password')
      }

      if(foundUser.active === 0) {
        return Boom.notAcceptable('Please, confirm your email');
      }

      if(foundUser.status === _enum.REJECTED) {
        return Boom.notAcceptable('You are rejected');
        // return responseService.NotAllowed(reply, response.message[language]);
      }

      if(foundUser.status === _enum.PENDING) {
        return Boom.notAcceptable('Your request is still pending');
        // return responseService.NotAllowed(reply, response.message[language]);
      }

      if(foundUser.twoFactorAuthentication && request.headers['x-opt']) {

        if(_.isNil(request.headers['x-opt']) && !_.isNumber(parseInt(request.headers['x-opt']))) {

          return Boom.unauthorized('Invalid 2FA code');
        }

        if(parseInt(request.headers['x-opt']) !== parseInt(foundUser.twoFactorAuthenticationCode)) {

          return Boom.unauthorized('Invalid 2FA code');
        }
        if(!_.isEmpty(foundUser) && foundUser.twoFactorAuthentication && parseInt(request.headers['x-opt']) === parseInt(foundUser.twoFactorAuthenticationCode)) {

          await models.users.update({ twoFactorAuthenticationCode: null }, { where: { id: foundUser.id } });
          const agent = useragent.lookup(request.headers['user-agent']);
          // const accessToken = jwtService.generateUserAccessToken({
          //   id: foundUser.id,
          //   name: foundUser.name,
          //   email: foundUser.email,
          //   active: foundUser.active
          // }, foundUser.secret, payload.stayLoggedIn, agent.toJSON());
          const accessToken = jwtService.generateToken(foundUser.id, foundUser.companyId, foundUser.role);
          // await userService.saveAccessToken(foundUser.id, accessToken, accessToken, agent.toJSON());
          return reply.response({status: 200, accessToken: accessToken,
            accessToken: accessToken, companyId: foundUser.companyId, leftMenu: leftMenu, urls: userURLs,
            actions: actions, message: "Login successfully" }).header('Authorization', accessToken);
        }
      }

      if(foundUser.twoFactorAuthentication) {
        const twoFactorAuthenticationCode = userService.generateTwoFactorAuthenticationCode();
        await models.users.update({ twoFactorAuthenticationCode: twoFactorAuthenticationCode }, { where: { id: foundUser.id } });
        await Mailer.sendTwoFactorAuthenticationMail(foundUser.email, twoFactorAuthenticationCode);

        return reply.response().code(206);
      }

      const agent = useragent.lookup(request.headers['user-agent']);
      // const accessToken = jwtService.generateUserAccessToken({
      //   id: foundUser.id,
      //   name: foundUser.name,
      //   email: foundUser.email,
      //   active: foundUser.active
      // }, foundUser.secret, payload.stayLoggedIn, agent.toJSON());
      const accessToken = jwtService.generateToken(foundUser.id, foundUser.companyId, foundUser.role);
      // await userService.saveAccessToken(foundUser.id, accessToken, accessToken, agent.toJSON());

      return reply.response({status: 200, accessToken: accessToken,
        accessToken: accessToken, companyId: foundUser.companyId, leftMenu: leftMenu, urls: userURLs,
        actions: actions, message: "Login successfully" }).header('Authorization', accessToken);
    }
    catch (e) {
      console.log('Error', e);
      return Boom.badImplementation('An internal server error occurred');
    }
  },
  forgetPassword: async function (request, reply) {
    const { payload } = request;
    let transaction = null;
    try {
      transaction = await models.sequelize.transaction();
      const foundUser = await models.users.findOne({ where: { email: payload.email } , transaction });

      if(!_.isEmpty(foundUser)) {

        const forgetToken = jwtService.generateUserAccessToken({ id: foundUser.id, email: foundUser.email }, foundUser.secret);
        await Mailer.sendUserforgetPasswordMail(payload.email, forgetToken);
        await transaction.commit();
        return responseService.OK(reply, { value: foundUser, message: 'Please, check your email' });
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
    const user =  await models.users.findOne({ where : {secret: request.payload.secret_code }});

    if(user){
      const newPassword = bcrypt.hashSync(request.payload.password, bcrypt.genSaltSync(10));
      await models.users.update({password: newPassword}, { where : {secret: request.payload.secret_code }, transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: user, message: 'Password reset successfully' });
    }
      await transaction.rollback();
      return Boom.notAcceptable(`This secret code is invalid`);

    } catch (error) {

      if(transaction){
        await transaction.rollback();
        return Boom.InternalServerError(`An Error Occured`);
      }
    }
  },
};
