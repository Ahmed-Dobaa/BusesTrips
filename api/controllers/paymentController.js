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
    console.log("req",request.payload);
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let RoutePayment = null;
        if("id" in payload){
          console.log("inside create");
          if(payload.id === null){  // create new RoutePayment
            console.log("models.routes_payment",models.routes_payment);
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
    console.log("req",request);
    let language = request.headers.language;
     try {
      const routes_payment = await models.sequelize.query(`SELECT * FROM routes_payment where deletedAt is null`, { type: QueryTypes.SELECT });
      console.log("routes_payment",routes_payment); 
      return responseService.OK(reply, {value: routes_payment, message: "Company Routes Payments" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },


  deleteRoutePayment: async (request, reply) => {
    console.log("req",request);
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedPayment = await models.routes_payment.destroy({where: {id: request.params.id }});
        console.log("deleted",deletedPayment);
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


