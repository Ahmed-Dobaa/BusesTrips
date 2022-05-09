'user strict';

const path = require('path');
const _ = require('lodash');
const Boom = require('boom');
const fs = require('fs');
const moment = require('moment');

const models = require(path.join(__dirname, '../models/index'));
const Mailer = require(path.join(__dirname, '../services/sendEmailService'));
const userService = require(path.join(__dirname, '../services/userService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const _enum = require(path.join(__dirname, '../services/enum'));
const { QueryTypes } = require('sequelize');

module.exports = {
  getUsers: async function (request, reply) {
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

  findAll: async function (request, reply) {
    try {
      // include Devices.
      const foundUser = await models.users.findAll({
        attributes: ['id', 'name', 'email', 'active', 'gender', 'country', 'phoneNumber', 'dob'],
        raw: true
      });

      return reply.response(foundUser).code(200);
    }
    catch (e) {
      console.log('error', e);

      return Boom.badImplementation('An internal server error occurred');
    }
  },
  findOne: async function (request, reply) {
    try {
      // include Devices.
      const foundUser = await models.users.findOne({
        where: { id: request.auth.decoded.id },
        include: [
          { model: models.user_device_token, as: 'loggedInDevices', attributes: ['id', 'device_name'] },
          { model: models.user_social_media, as: 'socialMedia', attributes: { exclude: ['userId'] } }
        ],
        attributes: ['id', 'name', 'email', 'active', 'gender', 'country', 'phoneNumber', 'dob']
      });

      return reply.response(foundUser).code(200);
    }
    catch (e) {
      console.log('error', e);

      return Boom.badImplementation('An internal server error occurred');
    }
  },
  update: async function (request, reply) {
    let transaction = null;
    try {
      transaction = await models.sequelize.transaction();

      if(!_.isEmpty(request.payload.socials)) {
        request.payload.socials.userId = request.auth.decoded.id;
        await models.user_social_media.upsert(request.payload.socials, { transaction });
      }

      await models.users.update(request.payload, { where: { id: request.auth.decoded.id }, transaction });
      await transaction.commit();

      return reply.response().code(200);
    }
    catch (e) {
      console.log('error', e);

      if(transaction) {
        await transaction.rollback();
      }

      return Boom.badImplementation('An internal server error occurred');
    }

  },
  uploadAvatar: async function (request, reply) {
    const allowedExtensions = ['.tif', '.png', '.svg', '.jpg', '.gif'];
    const uploadImageExtension = path.extname(request.payload.avatar.hapi.filename);
    const relativePath = `uploads/avatars/${request.auth.decoded.id}-${moment().valueOf()}-${uploadImageExtension}`;
    const fullPath = path.join(__dirname, '../', relativePath);
    let oldPath = null;
    try {

      if(!_.includes(allowedExtensions, uploadImageExtension.toLowerCase())) {

        return Boom.badRequest(`allowed images extension are  ${allowedExtensions.join(' , ')}`);
      }

      const foundUser = await models.users.findOne({ where: { id: request.auth.decoded.id }, raw: true });
      oldPath = foundUser.avatar;
      await request.payload.avatar.pipe(fs.createWriteStream(fullPath));
      await models.users.update({ avatar: relativePath }, { where: { id: request.auth.decoded.id } });

      return reply.response().code(201);
    }
    catch (e) {
      console.log('error', e);
      fs.unlinkSync(path.join(__dirname, '../', oldPath));

      return Boom.badImplementation('An internal server error occurred');
    }

  },
  getAvatar: async function (request, reply) {
    try {
      let avatarFullPath = path.join(__dirname, '../../uploads/default.png');
      const foundUser = await models.users.findOne({ where: { id: request.params.id }, raw: true });

      if(_.get(foundUser, 'avatar')) {
        avatarFullPath = path.join(__dirname, '../../', foundUser.avatar);
      }

      return reply.file(avatarFullPath);
    }
    catch (e) {
      console.log('error', e);

      return Boom.badImplementation('An internal server error occurred');
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
  getDevices: async function (request, reply) {
    try {

      const userDevices = await models.user_device_token.findAll({
        where: { userId: request.auth.decoded.id },
        attributes: ['id', 'device_name', 'createdAt', 'updatedAt'],
        raw: true
      });

      return reply.response(userDevices).code(200);
    }
    catch (e) {
      console.log('error', e);
      throw Boom.notImplemented(e);
    }
  },
  logoutDevice: async function (request, reply) {
    let transaction = null;
    try {

      transaction = await models.sequelize.transaction();
      await models.user_device_token.destroy({
        where: {
          userId: request.auth.decoded.id,
          id: request.params.deviceId
        },
        transaction
      });

      await transaction.commit();

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
  update2fa: async function (request, reply) {
    try {
      const enable2fa = request.body.enable;

      await models.users.update({ twoFactorAuthentication: enable2fa }, { where: { id: request.auth.decoded.id } });

      return reply.response().code(200);
    }
    catch (e) {
      console.log('error', e);
      throw Boom.notImplemented(e);
    }
  },
  regenerate2fa: async function (request, reply) {
    try {

      const twoFactorAuthenticationCode = userService.generateTwoFactorAuthenticationCode();
      await models.users.update({ twoFactorAuthenticationCode: twoFactorAuthenticationCode }, { where: { email: request.payload.email } });
      await Mailer.sendTwoFactorAuthenticationMail(request.auth.decoded.email, twoFactorAuthenticationCode);

      return reply.response().code(201);
    }
    catch (e) {
      console.log('error', e);
      throw Boom.notImplemented(e);
    }
  },
  checkingMailUniqueness: async function (request, reply) {
    try {
      const foundUser = await models.users.findOne({
        where: { email: request.query.email },
        attributes: ['email']
      });

      if(_.isEmpty(foundUser)) {
        return reply.response().code(204);
      }

      return reply.response().code(409);
    }
    catch (e) {
      console.log('error', e);

      return Boom.badImplementation('An internal server error occurred');
    }
  }
};
