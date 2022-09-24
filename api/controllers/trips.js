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
            // let startDate = new Date(payload.startDate);
            // let endDate = new Date(payload.endDate);
            // startDate.setHours(10)
            // lastToday =  lastToday.setHours ( lastToday.getHours() + 4 )

            // do{
              // let last = startDate.getHours() + 4;
              // let day = startDate.toString().split(' ')[0];
              for(let i = 0; i < payload.days.length; i++){
                // if(day === payload.days[i].name.substring(0, 3)){
                  // do{
                      tripDayes = {"tripId": t, "day": payload.days[i].name,
                         "from": payload.from, "to": payload.to};
                      await models.trips_days.create(tripDayes, {transaction});



                    // if(payload.interval === '52'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 5 )
                    // }
                    // if(payload.interval === '53'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 10 )
                    // }
                    // if(payload.interval === '54'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 15 )
                    // }

                    // if(payload.interval === '55'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 20 )
                    // }

                    // if(payload.interval === '56'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 25 )
                    // }

                    // if(payload.interval === '57'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 30 )
                    // }

                    // if(payload.interval === '58'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 35 )
                    // }

                    // if(payload.interval === '59'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 40 )
                    // }

                    // if(payload.interval === '60'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 45 )
                    // }

                    // if(payload.interval === '61'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 50 )
                    // }

                    // if(payload.interval === '62'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 55 )
                    // }

                    // if(payload.interval === '63'){
                    //   startDate.setMinutes ( startDate.getMinutes() + 60 )
                    // }

                  // }while( startDate.getHours() <= last)
                // }
              }
            //  startDate.setHours(startDate.getHours() + 4);
        //      startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        //      startDate.setHours(10)
        // console.log(startDate)
            // }while(startDate < endDate)

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
                    let days = await models.sequelize.query(`SELECT id, \`date\`, \`day\`, createdAt
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
  }

}


