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

  createBusesRoutes: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
        if("id" in payload){
          if(payload.id === null){  // create new bus route
            let location =  await models.buses_locations.create(payload, {transaction});
            if(payload.points != null){
            for(let i = 0; i < payload.points.length; i++){
                payload.points[i]["bus_location_id"] = location.id;
                payload.points[i]["pointId"] = payload.points[i].id;
                delete payload.points[i].id;
                await models.buses_locations_points.create(payload.points[i], {transaction});
            }}
          }else{
            await models.buses_locations.update(payload, {where: {id: payload.id }}, {transaction});
            if(payload.points != null){
            for(let i = 0; i < payload.points.length; i++){
              if(payload.points[i].id === null){
                payload.points[i]["bus_location_id"] = payload.id;
                payload.points[i]["pointId"] = payload.points[i].id;
                delete payload.points[i].id;
                await models.buses_locations_points.create(payload.points[i], {transaction});
              }else{
                await models.buses_locations_points.update(payload.points[i], {where: {id: payload.points[i].id}}, {transaction});
              }

             }
            }
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }


      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Buses routes updated successfully' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getBusesRoutes: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      locations = await models.sequelize.query(` SELECT l.id, l.companyId, c.name companyName, routeName,
      startPoint,
      (select point from points p where p.id = startPoint) startPointName,
      (select lat from points p where p.id = startPoint) startPointLat,
      (select \`long\` from points p where p.id = startPoint) startPointLong,
      endPoint,
      (select point from points p where p.id = endPoint) endPointName,
      (select lat from points p where p.id = endPoint) endPointLat,
      (select \`long\` from points p where p.id = endPoint) endPointLong
      FROM buses_locations l, companies c
      where l.companyId = ${request.params.companyId}
      and l.companyId = c.id
      and l.deletedAt is null
      `, { type: QueryTypes.SELECT });


      for(let i = 0 ; i < locations.length; i++){
        let routes = await models.sequelize.query(` select id, pointId,
        (select point from points p where p.id = pointId) name,
        (select lat from points p where p.id = pointId) lat,
        (select \`long\` from points p where p.id = pointId) \`long\`
      from  buses_locations_points
      where bus_location_id = ${locations[i].id}
      and deletedAt is null
      `, { type: QueryTypes.SELECT });
      locations[i]["points"] = routes;
      //   let array = locations[i].route.split(",");
      //   locations[i]["route"] = array;
      }
      //await models.buses_locations.findAll({where: {companyId: request.params.companyId}});
       return responseService.OK(reply, {value: locations, message: "Company buses locations" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  deleteBusRoute: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.buses_locations.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This bus route deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


