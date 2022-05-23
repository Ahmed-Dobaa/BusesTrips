'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));
const errorService = require(path.join(__dirname, '../services/errorService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');

module.exports = {

  createStaff: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;

        if(payload.id === null){  // create new staff
         await models.companies_staff.create(payload, {transaction});
       }else{
         await models.companies_staff.update(payload, {where: {id: payload.id }}, {transaction});
       }

      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Staff updated successfully' });
    }
    catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getCompanyStaff: async (request, reply) => {
    let language = request.headers.language;
    let staff = null;
     try {
         staff = await models.sequelize.query(`SELECT id, name, job as job,
                   (select lookupDetailName from lookup_details l where l.id = job) jobName, phoneNumber, companyId
                   FROM companies_staff where companyId = ${request.params.companyId}
                   and deletedAt is null `, { type: QueryTypes.SELECT });

       return responseService.OK(reply, {value: staff, message: "Company staff" });
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


