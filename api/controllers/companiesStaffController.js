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

  driverLogin: async (request, reply) => {
    let language = request.headers.language;
    let staff = null, bus= null, trip, result;
    let today = new Date();
     try {
         staff= await models.sequelize.query(`SELECT id, name, job as job,
                   (select lookupDetailName from lookup_details l where l.id = job) jobName, phoneNumber, companyId
                   FROM companies_staff where phoneNumber = '${request.payload.phoneNumber}'
                   and deletedAt is null `, { type: QueryTypes.SELECT });
        if(staff.length !=0 ){
           bus= await models.sequelize.query(`select id, busPlateNumber, busSeatsNumber, seatsStructure seatsStructureId,
                          (select lookupDetailName from lookup_details l where l.id= seatsStructure) seatsStructure
                          from buses where driverId= ${staff[0].id}`, { type: QueryTypes.SELECT });

          //  trip= await models.sequelize.query(`select * from single_trips where busId= ${bus[0].id}`, { type: QueryTypes.SELECT });
           console.log("todayy---",today);
           trip= await models.sequelize.query(`select s.tripId , name tripName, busRouteId, routeName,s.date,
            p.point startPoint, 
           (select point from points po where po.id = b.endPoint) endPoint, p.lat startPointLat, 
           p.long startPointLong,
            (select lat from points po where po.id = b.endPoint) endPointLat, 
            (select po.long from points po where po.id = b.endPoint) endPointLong from single_trips s,
             trips t, buses_locations b, points p , 
           trips_days td where s.tripId = td.id and t.id = td.tripId and t.busRouteId = b.id and 
           b.startPoint = p.id and s.date < '2022-11-15' and busId= ${bus[0].id}`, { type: QueryTypes.SELECT });
          
           for(let i= 0; i < trip.length; i++){
            let p= await models.sequelize.query(`select point, lat, p.long
             from buses_locations_points l, points p
             where l.pointId = p.id
             and bus_location_id= ${trip[i].busRouteId}
            `, { type: QueryTypes.SELECT });

            trip[i]["routePoints"]= p;
           }
           console.log("trip---------",trip)

           result= {driverInfo: staff[0], busInfo: bus[0], trips: trip}
           return responseService.OK(reply, { value: result, message: "Driver Data" });
        }else{
          return Boom.unauthorized('Wrong Mobile Number Or Password')
        }

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


