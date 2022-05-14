'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));

const userService = require(path.join(__dirname, '../services/userService'));
const Mailer = require(path.join(__dirname, '../services/sendEmailService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const _enum = require(path.join(__dirname, '../services/enum'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');

module.exports = {

  createCompany: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let createdUser = null;
      if(request.payload.id === null){
        const foundUser = await models.users.findOne({ where: { email: request.payload.email }, raw: true });

      if(!_.isEmpty(foundUser)) {
        await transaction.rollback();
        return Boom.notAcceptable('This email alreday registered!');
      }
      const activationToken = userService.generateActivationToken();
      payload.activationToken = activationToken;
      payload.secret = userService.generateActivationToken();

        let company = await models.companies.create(request.payload, {transaction})
        payload['role'] = _enum.COMPANY;
        payload['companyId'] = company.id;

         createdUser = await models.users.create(request.payload, {transaction});
        const privateAttributes = ['password', 'activationToken', 'secret', 'country'];

        createdUser = _.omit(createdUser.dataValues, privateAttributes);
        await Mailer.sendUserActivationMail(request.payload.email, activationToken);
      }else{

        payload["companyId"] = request.payload.id;
        delete payload.id;
        await models.companies.update(request.payload, {where: {id: request.payload.companyId}}, {transaction});
         createdUser = await models.users.update({
           name: payload.name , email: payload.email, phoneNumber: payload.phoneNumber
         }, {where: {companyId: request.payload.companyId, role: _enum.COMPANY}}, {transaction});
      }

      await transaction.commit();
      return responseService.OK(reply, { value: createdUser, message: `Company updated successfully` });
    }
    catch (e) {
      if(transaction) {
      transaction.rollback();
      }
       throw Boom.notImplemented(e);
      }
  },

  getCompanies: async (request, reply) => {
    let language = request.headers.language;
    let companies = null;
     try {
      companies = await models.sequelize.query(`SELECT c.id, c.name, c.email, c.phoneNumber, s.id userId, s.status,
         (select lookupDetailName from lookup_details l where l.id = s.status) statusName
         FROM companies c, users s
         where c.id = s.companyId
         and c.deletedAt is null `, { type: QueryTypes.SELECT });

       return responseService.OK(reply, {value: companies, message: "All companies" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  deleteOneStaff: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.companies_staff.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This employee deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


