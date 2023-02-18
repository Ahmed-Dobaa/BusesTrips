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
      let tripDayes = {};
      let trip = null;
        if("id" in payload){
          if(payload.id === null){  // create new trip
             trip = await models.trips.create(payload, {transaction});
             const t = trip.id;
              for(let i = 0; i < payload.days.length; i++){
                      tripDayes = {"tripId": t, "day": payload.days[i].name,
                         "from": payload.from, "to": payload.to};
                      await models.trips_days.create(tripDayes, {transaction});
              }
          }else{
            await models.trips.update(payload, {where: {id: payload.id }}, {transaction});
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }


      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Trips updated successfully' });
    }
    catch (e) {
      console.log(e);
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
      locations = await models.sequelize.query(` SELECT t.id, t.name, startDate, endDate,
                  busRouteId, t.companyId, c.name companyName
                  FROM trips t, companies c
                  where t.companyId = ${request.params.companyId}
                  and t.companyId = c.id
                  and t.deletedAt is null
                  `, { type: QueryTypes.SELECT });

                  for(let i =0 ; i < locations.length; i++){
                    let days = await models.sequelize.query(`SELECT id, \`date\`, \`day\`, createdAt, \`from\`, \`to\`
                    FROM trips_days
                    where tripId = ${locations[i].id}
                    and deletedAt is null
                  `, { type: QueryTypes.SELECT });
                    locations[i]["days"] = days;
                  }
       return responseService.OK(reply, {value: locations, message: "Company trips" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },


  getTripsBasedRoute: async (request, reply) => {
    let language = request.headers.language;
    let locations = null;
     try {
      locations = await models.sequelize.query(` SELECT d.id, Day, Concat (t.name,', Day ', d.day, ' From ', d.from, ' To ', d.to) trip
                  FROM trips t, trips_days d
                  where busRouteId = ${request.params.routeId}
                  and t.deletedAt is null
                  and t.id = d.tripId
                  `, { type: QueryTypes.SELECT });

                  for(let i= 0; i < locations.length; i++){
                    if(locations[i].Day === 'Sunday') locations[i]["day"]= 0;
                    if(locations[i].Day === 'Monday') locations[i]["day"]= 1;
                    if(locations[i].Day === 'Tuesday') locations[i]["day"]= 2;
                    if(locations[i].Day === 'Wednesday') locations[i]["day"]= 3;
                    if(locations[i].Day === 'Thursday') locations[i]["day"]= 4;
                    if(locations[i].Day === 'Friday') locations[i]["day"]= 5;
                    if(locations[i].Day === 'Saturday') locations[i]["day"]= 6;

                    delete locations[i].Day;
                  }
                  // for(let i =0 ; i < locations.length; i++){
                  //   let days = await models.sequelize.query(`SELECT id, \`date\`, \`day\`, createdAt
                  //   FROM trips_days
                  //   where tripId = ${locations[i].id}
                  //   and deletedAt is null
                  // `, { type: QueryTypes.SELECT });
                  //   locations[i]["days"] = days;
                  // }
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
  },

  getTripDetailsBasedOnId: async (request,reply)=>{
    let language = request.headers.language;
     try {
      const tripDetails = await models.sequelize.query(`SELECT DISTINCT b.id as routId ,t.name as tripName, b.routeName, st.busId , 
      bu.driverId, bu.supervisorId, bu.busPlateNumber , cf.name as driverName ,cf.phoneNumber as driverPhone
      from trips as t , buses_locations as b , single_trips st , buses bu , companies_staff cf
      WHERE t.id = (SELECT tripId from trips_days WHERE id = ${request.params.tripId}) AND b.id = 
      (SELECT busRouteId from trips WHERE id = (SELECT tripId from trips_days WHERE id = ${request.params.tripId})) AND 
      st.tripId = ${request.params.tripId} AND bu.id = st.busId AND cf.id = bu.driverId`, { type: QueryTypes.SELECT });
       console.log("tripDetails------",tripDetails)
      return responseService.OK(reply, {value: tripDetails, message: "Trip Details" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  }

}


