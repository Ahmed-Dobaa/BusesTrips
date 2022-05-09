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


module.exports = {
  registerAdmin: async (request, reply) => {
    let transaction;
    try {
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
        payload['role'] = _enum.COMPANY;
      }
      let createdUser = await models.users.create(request.payload);
      const privateAttributes = ['password', 'activationToken', 'secret', 'country'];

      createdUser = _.omit(createdUser.dataValues, privateAttributes);
      // await Mailer.sendUserActivationMail(request.payload.email, activationToken);
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
          const accessToken = jwtService.generateUserAccessToken({
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            active: foundUser.active
          }, foundUser.secret, payload.stayLoggedIn, agent.toJSON());
          // await userService.saveAccessToken(foundUser.id, accessToken, accessToken, agent.toJSON());
          return reply.response({status: 200, accessToken: accessToken, user_info: foundUser, message: "Login successfully" }).header('Authorization', accessToken);
        }
      }

      if(foundUser.twoFactorAuthentication) {
        const twoFactorAuthenticationCode = userService.generateTwoFactorAuthenticationCode();
        await models.users.update({ twoFactorAuthenticationCode: twoFactorAuthenticationCode }, { where: { id: foundUser.id } });
        await Mailer.sendTwoFactorAuthenticationMail(foundUser.email, twoFactorAuthenticationCode);

        return reply.response().code(206);
      }

      const agent = useragent.lookup(request.headers['user-agent']);
      const accessToken = jwtService.generateUserAccessToken({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        active: foundUser.active
      }, foundUser.secret, payload.stayLoggedIn, agent.toJSON());
      // await userService.saveAccessToken(foundUser.id, accessToken, accessToken, agent.toJSON());

      return reply.response({status: 200, accessToken: accessToken, user_info: foundUser, message: "Login successfully" }).header('Authorization', accessToken);
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
        await models.userForgetPassword.upsert({ userId: foundUser.id, forgetToken: forgetToken, createdAt: moment().format('YYYY-MM-DD hh:mm:ss'), revoked: '0' }, { transaction });
        await Mailer.sendUserforgetPasswordMail(payload.email, forgetToken);
        await transaction.commit();
        return reply.response({"status": 200, "message": "Please, check your email"}).code(200);
      }
      await transaction.rollback();
    return reply.response({"status": 406,"message": "This email is not exist"}).code(406);


    }
    catch (e) {
      console.log('error', e);

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
      const _password = bcrypt.hashSync(request.payload.password, bcrypt.genSaltSync(10));
      await models.users.update({password: _password}, { where : {secret: request.payload.secret_code }, transaction});
      await transaction.commit();
      return reply.response({status: 200, message: "Password updated successfully"}).code(200);
    }
      await transaction.rollback();
      return reply.response({status: 406, message: "This secret code is invalid"}).code(406);

    } catch (error) {

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
