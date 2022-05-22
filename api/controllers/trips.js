'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));
const errorService = require(path.join(__dirname, '../services/errorService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');
const company = require('../schemas/company');

module.exports = {

  createTrip: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      for(let i = 0; i < payload.length; i++){
        if("id" in payload[i]){
          if(payload[i].id === null){  // create new trip
              await models.trips.create(payload[i], {transaction});
          }else{
            await models.trips.update(payload[i], {where: {id: payload[i].id }}, {transaction});
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }
      }

      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Trips updated successfully' });
    }
    catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getTrips: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      locations = await models.sequelize.query(` SELECT t.id, name, startPoint, endPoint, busId,
                  busPlateNumber bus, busRouteId, route, t.companyId
                  FROM trips t, buses b, buses_locations l
                  where t.companyId = ${request.params.companyId}
                  and t.busId = b.id
                  and t.busRouteId = l.id
                  and t.deletedAt is null
                  `, { type: QueryTypes.SELECT });
       return responseService.OK(reply, {value: locations, message: "Company trips" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  deleteTrip: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.trips.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This trip deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


