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

  createPoints: async (request, reply) => {
    let transaction;
    let created = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
          if(payload.id === null){  // create new points
            for(let i = 0; i < payload.route.length; i++){
                payload.route[i]["companyId"] = payload.companyId;
                created = await models.points.create(payload.route[i], {transaction});
            }
          }else{
            await models.points.update(payload, {where: {id: payload.id }}, {transaction});
            for(let i = 0; i < payload.route.length; i++){
              if(payload.route[i].id === null){
                payload.route[i]["companyId"] = payload.companyId;
                created = await models.points.create(payload.route[i], {transaction});
              }else{
                await models.points.update(payload.route[i], {where: {id: payload.route[i].id}}, {transaction});
              }

          }
          }

      await transaction.commit();
      return responseService.OK(reply, { value: created, message: 'Points updated successfully' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  reservation: async (request, reply) => {
    let transaction;
    let created = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;

                created = await models.reservation.create(payload, {transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: created, message: 'Reservation done successfully' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getPoints: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      // locations = await models.sequelize.query(` SELECT l.id, l.companyId, c.name companyName,
      // l.createdAt, l.updatedAt, l.deletedAt
      // FROM buses_locations l, companies c
      // where l.companyId = ${request.params.companyId}
      // and l.companyId = c.id
      // and l.deletedAt is null
      // `, { type: QueryTypes.SELECT });


        let points = await models.sequelize.query(` select id, lat, \`long\`, \`point\`, companyId, main
      from  points
      where companyId = ${request.params.companyId}
      and deletedAt is null
      `, { type: QueryTypes.SELECT });
      //   let array = locations[i].route.split(",");
      //   locations[i]["route"] = array;

      //await models.buses_locations.findAll({where: {companyId: request.params.companyId}});
       return responseService.OK(reply, {value: points, message: "Points locations" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  getPointsBasedTripType: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      // locations = await models.sequelize.query(` SELECT l.id, l.companyId, c.name companyName,
      // l.createdAt, l.updatedAt, l.deletedAt
      // FROM buses_locations l, companies c
      // where l.companyId = ${request.params.companyId}
      // and l.companyId = c.id
      // and l.deletedAt is null
      // `, { type: QueryTypes.SELECT });


        let points = await models.sequelize.query(` select id, \`point\`
              from  points
              where tripType = ${request.params.tripPoint}
              and deletedAt is null
      `, { type: QueryTypes.SELECT });
      //   let array = locations[i].route.split(",");
      //   locations[i]["route"] = array;

      //await models.buses_locations.findAll({where: {companyId: request.params.companyId}});
       return responseService.OK(reply, {value: points, message: "This category points" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  getSearchTrips: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      // locations = await models.sequelize.query(` SELECT l.id, l.companyId, c.name companyName,
      // l.createdAt, l.updatedAt, l.deletedAt
      // FROM buses_locations l, companies c
      // where l.companyId = ${request.params.companyId}
      // and l.companyId = c.id
      // and l.deletedAt is null
      // `, { type: QueryTypes.SELECT });


        let points = await models.sequelize.query(` select id, name
              from trips
              where startDate like '%${request.payload.startDate}%'
              and busRouteId in (select id from buses_locations where startPoint= ${request.payload.startPoint}
                 and endPoint= ${request.payload.endPoint} )
              and deletedAt is null
      `, { type: QueryTypes.SELECT });
      //   let array = locations[i].route.split(",");
      //   locations[i]["route"] = array;

      //await models.buses_locations.findAll({where: {companyId: request.params.companyId}});
       return responseService.OK(reply, {value: points, message: "Found trips" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },


  deletePoints: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.points.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This Point deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


