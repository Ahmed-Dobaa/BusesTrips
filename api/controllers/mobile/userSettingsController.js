
const Boom = require('boom');
const path = require('path');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const models = require(path.join(__dirname, '../../models/index'));
const errorService = require(path.join(__dirname, '../../services/errorService'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
const helperService = require(path.join(__dirname, '../../services/helperService'));
const _enum = require(path.join(__dirname, '../../services/enum'));
const moment = require('moment');
const fs = require('fs');

module.exports = {

userSettings: async(request, reply) => {
   try {
    const userSettingFound = await models.users_settings.findAll({where: {customerId: request.params.customerId }});
    if(!_.isEmpty(userSettingFound)){
      const systemSetting =  await models.sequelize.query(`SELECT id, currency,
      lang,
      emailNotification, pushNotification
      FROM users_settings
      where customerId = ${request.params.customerId}
      and deletedAt is null`, { type: QueryTypes.SELECT });
      return responseService.OK(reply, {value: systemSetting, message: 'All user setting'});
    }
     return Boom.notAcceptable(`Sorry, You don't have settings yet`);
   } catch (error) {
    return responseService.InternalServerError(reply, error);
   }
 },

updateUserSettings: async(request, reply) => {
  let transaction;
  const { payload } = request;
   try {
    transaction = await models.sequelize.transaction();
     const userSettingFound = await models.users_settings.findAll({where: {customerId: request.params.customerId }});
     if(!_.isEmpty(userSettingFound)){
      const updatedSettings = await models.users_settings.update(payload, {where: {customerId: request.params.customerId}}, { transaction });
      await transaction.commit();
      return responseService.OK(reply, { value: updatedSettings, message: `Your settings updated successfully` });
     }
     await transaction.rollback();
     return Boom.notAcceptable(`Sorry, You don't have settings yet`);
   } catch (error) {
    if(transaction) {
      await transaction.rollback();
    }
    return responseService.InternalServerError(reply, error);
   }
 },


}
