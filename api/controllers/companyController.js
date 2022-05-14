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
      for(let i = 0; i < payload.length; i++){
        if(payload[i].id === null){  // create new staff
         await models.companies_staff.create(payload[i], {transaction});
       }else{
         await models.companies_staff.update(payload[i], {where: {id: payload[i].id }}, {transaction});
       }
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

  getCompanies: async (request, reply) => {
    let language = request.headers.language;
    let companies = null;
     try {
      companies = await models.sequelize.query(`SELECT id, name, email, phoneNumber,
         (select lookupDetailName from lookup_details l where l.id =
           (select status from users s where s.companyId = id)) status
         FROM companies
         where deletedAt is null `, { type: QueryTypes.SELECT });

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


