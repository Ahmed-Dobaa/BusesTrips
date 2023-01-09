'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');
const routes_payment = require('../models/routes_payment');

module.exports = {

  createRoutePayment: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let RoutePayment = null;
        if("id" in payload){
          if(payload.id === null){  // create new RoutePayment
             RoutePayment = await models.routes_payment.create(payload, {transaction});
          }else{
            await models.routes_payment.update(payload, {where: {id: payload.id }}, {transaction});
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }


      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'RoutePayments updated successfully' });
    }
    catch (e) {
      console.log(e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getRoutePayments: async (request, reply) => {
    let language = request.headers.language;
     try {
      routes_payment = await models.sequelize.query(` SELECT * FROM routes_payment where deletedAt is null`, { type: QueryTypes.SELECT });
       return responseService.OK(reply, {value: routes_payment, message: "Company Routes Payments" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },


  deleteRoutePayment: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedPayment = await models.routes_payment.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedPayment, message: 'This Route Payment deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


