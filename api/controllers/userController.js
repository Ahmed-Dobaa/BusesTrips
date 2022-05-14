'user strict';

const path = require('path');
const _ = require('lodash');
const Boom = require('boom');
const fs = require('fs');
const moment = require('moment');

const jwtService = require(path.join(__dirname, '../services/jwtService'));
const models = require(path.join(__dirname, '../models/index'));
const Mailer = require(path.join(__dirname, '../services/sendEmailService'));
const userService = require(path.join(__dirname, '../services/userService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const _enum = require(path.join(__dirname, '../services/enum'));
const { QueryTypes } = require('sequelize');

module.exports = {
  getUsers: async function (request, reply) {
       const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    try {
        const users = await models.sequelize.query(`select id, name, email, phoneNumber, role,
        (select name from roles l where l.id = role) roleName,
        status, (select lookupDetailName from lookup_details l where l.id = status) statusName
        from users
        where deletedAt is null`, { type: QueryTypes.SELECT });
      return responseService.OK(reply, { value: users, message: `All users` });
    } catch (error) {
      return responseService.InternalServerError(reply, error);
    }
  },

  updateUserStatus: async (request, reply) =>{
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    let { payload } = request;
    try {
      transaction = await models.sequelize.transaction();
      const foundUser = await models.users.findOne({where: {id: request.params.userId}}, {transaction});
      if(_.isEmpty(foundUser)){
        await transaction.rollback();
        return Boom.notAcceptable(`This user isn't found`);
      }

      if(payload.status === _enum.APPROVED && foundUser.role === null){
        await transaction.rollback();
        return Boom.notAcceptable(`please, first assign role to this user`);
      }

      const updatedUser = await models.users.update({status: payload.status}, {where: {id: request.params.userId}}, {transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: updatedUser, message: `User status updated Successfully` });

    } catch (error) {
      if(transaction) {
        await transaction.rollback();
      }
       return responseService.InternalServerError(reply, error);
      }
  },

  updateUserRole: async (request, reply) =>{
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    let { payload } = request;
    try {
      transaction = await models.sequelize.transaction();
      const foundUser = await models.users.findOne({where: {id: request.params.userId}}, {transaction});
      if(_.isEmpty(foundUser)){
        await transaction.rollback();
        return Boom.notAcceptable(`This user isn't found`);
      }

      const updatedUser = await models.users.update({role: payload.role}, {where: {id: request.params.userId}}, {transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: updatedUser, message: `User role updated Successfully` });

    } catch (error) {
      if(transaction) {
        await transaction.rollback();
      }
       return responseService.InternalServerError(reply, error);
      }
  },

  updateUser: async (request, reply) =>{
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    let { payload } = request;
    try {
      transaction = await models.sequelize.transaction();
      const foundUser = await models.users.findOne({where: {id: request.params.userId}}, {transaction});
      if(_.isEmpty(foundUser)){
        await transaction.rollback();
        return Boom.notAcceptable(`This user isn't found`);
      }
      let activationToken = null;
      if(payload.email != foundUser.email){
        payload.active = 0;
        activationToken = userService.generateActivationToken();
        payload.activationToken = activationToken;
      }

      const updatedUser = await models.users.update( payload , {where: {id: request.params.userId}}, {transaction});

      if(payload.email != foundUser.email){
        await Mailer.sendUserActivationMail(payload.email, activationToken);
      }

      await transaction.commit();
      return responseService.OK(reply, { value: updatedUser, message: `User updated Successfully` });

    } catch (error) {
      if(error.errors[0].type === 'unique violation'){
        await transaction.rollback();
        return Boom.notAcceptable(`This email is already registered`);
      }
      if(transaction) {
        await transaction.rollback();
      }
       return responseService.InternalServerError(reply, error);
      }
  },

  deleteUser: async (request, reply) =>{
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const foundUser = await models.users.findOne({where: {id: request.params.userId}}, {transaction});
      if(_.isEmpty(foundUser)){
        await transaction.rollback();
        return Boom.notAcceptable(`This user isn't found`)
      }

      const deletedUser = await models.users.destroy({where: {id: request.params.userId}}, {transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: deletedUser, message: `User deleted successfully` });

    } catch (error) {
      if(transaction) {
        await transaction.rollback();
      }
       return responseService.InternalServerError(reply, error);
      }
  },
  changePassword: async function (request, reply) {
    let transaction = null;
    try {


      const foundUser = await models.users.findOne({ id: request.auth.decoded.id });

      if(!_.isEmpty(foundUser) && !foundUser.validPassword(request.payload.currentPassword)) {

        return Boom.unauthorized('Wrong current Password');
      }
      transaction = await models.sequelize.transaction();
      await models.users.update({ password: request.payload.password }, { where: { id: request.auth.decoded.id }, transaction });

      if(request.payload.logout) {

        await models.user_device_token.destroy({ where: { userId: request.auth.decoded.id }, transaction });
      }

      await transaction.commit();
      await Mailer.sendPasswordChangedMail(request.auth.decoded.email);

      return reply.response().code(200);
    }
    catch (e) {
      console.log('error', e);

      if(transaction) {
        await transaction.rollback();
      }
      throw Boom.notImplemented(e);
    }
  },


};
