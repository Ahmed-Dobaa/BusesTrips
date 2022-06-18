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

  createSingleTrip: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let singleTrip = null;
        if("id" in payload){
          if(payload.id === null){  // create new single trip
            singleTrip = await models.single_trips.create(payload, {transaction});
          }else{
            await models.single_trips.update(payload, {where: {id: payload.id }}, {transaction});
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }


      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Single trips updated successfully' });
    }
    catch (e) {
      console.log(e);
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  singleTrips: async (request, reply) => {
    let language = request.headers.language;
    let singleTrips = null;
     try {
      singleTrips = await models.sequelize.query(` SELECT busId, b.busPlateNumber,
                  Concat (day, ' from ', t.from, ' to ', t.to) trip,
                  s.date, routeId, bl.routeName,
                  startPoint,
                  (select point from points p where p.id = startPoint) startPointName,
                  (select lat from points p where p.id = startPoint) startPointLat,
                  (select \`long\` from points p where p.id = startPoint) startPointLong,
                  endPoint,
                  (select point from points p where p.id = endPoint) endPointName,
                  (select lat from points p where p.id = endPoint) endPointLat,
                  (select \`long\` from points p where p.id = endPoint) endPointLong
                  FROM single_trips s, companies c, buses b, trips_days t, buses_locations bl
                  where s.companyId = ${request.params.companyId}
                  and s.companyId = c.id
                  and s.busId = b.id
                  and s.tripId = t.id
                  and s.routeId = bl.id
                  and s.deletedAt is null
                  `, { type: QueryTypes.SELECT });

                  for(let i = 0 ; i < singleTrips.length; i++){
                    let routes = await models.sequelize.query(` select
                    (select point from points p where p.id = pointId) name,
                    (select lat from points p where p.id = pointId) lat,
                    (select \`long\` from points p where p.id = pointId) \`long\`
                  from  buses_locations_points
                  where bus_location_id = ${singleTrips[i].routeId}
                  and deletedAt is null
                  `, { type: QueryTypes.SELECT });
                  singleTrips[i]["route"] = routes;
                  //   let array = locations[i].route.split(",");
                  //   locations[i]["route"] = array;
                  }
                  return responseService.OK(reply, {value: singleTrips, message: "Company trips" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },



  deleteSingleTrip: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.single_trips.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This single trip deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


