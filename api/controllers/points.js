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
    let pickupPoint = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      pickupPoint = await models.sequelize.query(`select pickup from customers where id = ${payload.userId} and deletedAt is null`, { type: QueryTypes.SELECT });
      console.log("pickupPoint",pickupPoint)
      payload.pickup = pickupPoint[0].pickup;
      console.log("payload---",payload)
      created = await models.reservation.create(payload, {transaction});
      await transaction.commit();
      return responseService.OK(reply, { value: created, message: 'Reservation done successfully,but not confirmed!' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  updateStatusOfReservationAndIncreaseCount: async (request,reply)=>{
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      console.log("payload",payload);
      await models.trips_days.update({count:payload.count}, {where: {id: payload.tripId}},{ transaction });
      await models.reservation.update({status:payload.status}, {where: {id: payload.reservationId}},{ transaction });
      await transaction.commit();
      return responseService.OK(reply, { value: [], message: 'Reservation confirmed successfully' });
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


        let points = await models.sequelize.query(` select id, lat, \`long\`, \`point\`, companyId, main,
        tripType, (select lookupDetailName from lookup_details l where l.id = tripType) lookTypeName
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
      let points;
      if(request.params.tripPoint === '64' ){
         points = await models.sequelize.query(` select id, \`point\`
              from  points
              where tripType = ${request.params.tripPoint}
              and deletedAt is null
      `, { type: QueryTypes.SELECT });
    }
    let schools;
    let schoolsPoints;

    if(request.params.tripPoint === '65' || request.params.tripPoint === '69'){
       schools = await models.sequelize.query(` select id, \`point\`
            from  points
            where tripType = 65
            and deletedAt is null
      `, { type: QueryTypes.SELECT });

       schoolsPoints = await models.sequelize.query(` select id, \`point\`
            from  points
            where tripType = 69
            and deletedAt is null
      `, { type: QueryTypes.SELECT });
    }
    let universities;
    let universitiesPoints;
    console.log(request.params.tripPoint)
    if(request.params.tripPoint === '66' || request.params.tripPoint === '70'){
      console.log("dadada")
         universities = await models.sequelize.query(` select id, \`point\`
                from  points
                where tripType = 66
                and deletedAt is null
        `, { type: QueryTypes.SELECT });

         universitiesPoints = await models.sequelize.query(` select id, \`point\`
                from  points
                where tripType = 70
                and deletedAt is null
        `, { type: QueryTypes.SELECT });
    }
       return responseService.OK(reply, {value: {schools: schools, schoolsPoints: schoolsPoints,
        universities: universities, universitiesPoints: universitiesPoints, points: points}, message: "This category points" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  // getSearchTrips: async (request, reply) => {
  //   let language = request.headers.language;
  //   let locations = null;
  //   let trip= [];
  //    try {

  //      if(request.payload.type === 64){
  //       let points = await models.sequelize.query(`
  //       select t.id, t.name, busRouteId, routeName, b.id routeId
  //       from trips t, buses_locations b
  //       where t.busRouteId = b.id
  //       and busRouteId in (select id from buses_locations blp
  //       where blp.startPoint = ${request.payload.startPoint} and blp.endPoint = ${request.payload.endPoint})
  //         `, { type: QueryTypes.SELECT });

  //         console.log('points---',points)

  //         for(let i= 0; i < points.length; i++){
  //           let routePoints = await models.sequelize.query(`SELECT pointId, p.point,p.lat,p.long
  //                       from buses_locations_points b, points p
  //                       where bus_location_id= ${points[i].routeId}
  //                       and b.pointId = p.id
  //                       and b.deletedAt is null
  //             `, { type: QueryTypes.SELECT });
  //             // points[i]['routePoints']= routePoints;
  //            console.log('Point---',points[i])
  //            console.log('routePoints---',routePoints)

  //             let routePayment = await models.sequelize.query(`SELECT * from routes_payment WHERE routeId = ${points[i].routeId} and deletedAt is null`, { type: QueryTypes.SELECT });
  //             points[i]["routePayment"]= routePayment[0];

  //         let days = await models.sequelize.query(`select * from trips_days where tripId= ${points[i].id}
  //             `, { type: QueryTypes.SELECT });
  //             // points[i]["days"]= days

  //           for(let j= 0; j < days.length; j++){
  //             console.log(points[i].name)
  //             console.log("------------")
  //             days[j]["name"]= points[i].name;
  //             days[j]["routeName"]= points[i].routeName;
  //             days[j]["routePoints"]= routePoints;
  //             days[j]["routePayment"]= routePayment[0];
  //             trip.push(days[j])
  //            }
  //           console.log(trip)
  //           console.log("+++++++++++")

  //           }
  //         //   // days= null;
  //         // //   let routePoints = await models.sequelize.query(`SELECT pointId, p.point
  //         // //   from buses_locations_points b, points p
  //         // //   where bus_location_id= ${points[i].routeId}
  //         // //   and b.pointId = p.id
  //         // //   and b.deletedAt is null
  //         // // `, { type: QueryTypes.SELECT });
  //         // // trip.push
  //         // }
  //       // for(let i= 0; i < points.length; i++){

  //       // }
  //       console.log("points from payload.type === 64 " , trip);

  //         return responseService.OK(reply, {value: trip, message: "Found trips" });
  //      }

  //      if(request.payload.type === 65){
  //       const child= await models.childs.findOne({ where: { id: request.payload.child}});
  //             let points = await models.sequelize.query(`
  //             SELECT t2.name, st.tripId, bl.routeName, bl.id routeId, b2.busPlateNumber, b2.busSeatsNumber,
  //             (select lookupDetailName from lookup_details l where l.id= b2.seatsStructure) seatsStructure
  //             FROM single_trips st, trips t2, buses_locations bl, buses b2
  //             where st.tripId = t2.id
  //             and t2.busRouteId = bl.id
  //             and st.busId = b2.id
  //             and ( bl.startPoint = ${child.school} or bl.endPoint = ${child.school})
  //             and st.deletedAt is null
  //         `, { type: QueryTypes.SELECT });
  //         console.log(points)
  //       for(let i= 0; i < points.length; i++){
  //         let route = await models.sequelize.query(`
  //         SELECT pointId, p.point,p.lat,p.long
  //         from buses_locations_points b, points p
  //         where bus_location_id= ${points[i].routeId}
  //         and b.pointId = p.id
  //         and b.deletedAt is null
  //     `, { type: QueryTypes.SELECT });

  //        let routePayment = await models.sequelize.query(`SELECT * from routes_payment WHERE routeId = ${points[i].routeId} and deletedAt is null`, { type: QueryTypes.SELECT });

  //          points[i]["routePoints"]= route;
  //          points[i]["routePayment"]= routePayment[0];
  //       }

  //       console.log("points from payload.type === 65" , points);

  //         return responseService.OK(reply, {value: points, message: "Found trips" });

  //      }

  //      if(request.payload.type === 66 && request.payload.subsciptionType === 67){
  //       let points = await models.sequelize.query(` select s.id, (select name from trips t where t.id = tripId) name,
  //       (select busSeatsNumber from buses b where b.id= busId) busSeatsNumber,bl.routeName, bl.id routeId,
  //       (select lookupDetailName from lookup_details where id = (select seatsStructure from
  //         buses where id = busId)) seatsStructure,
  //         (select busPlateNumber from buses b where b.id= busId) busPlateNumber
  //           from single_trips s , trips t2, buses_locations bl
  //           where date like '%${request.payload.startDate}%'
  //           and tripId in (select id from trips where busRouteId in (select id from buses_locations where startPoint= ${request.payload.startPoint}
  //             and endPoint= ${request.payload.endPoint} )) and t2.busRouteId = bl.id
  //           and s.deletedAt is null
  //         `, { type: QueryTypes.SELECT });

  //         for(let i= 0; i < points.length; i++){
  
  //          let routePayment = await models.sequelize.query(`SELECT * from routes_payment WHERE routeId = ${points[i].routeId} and deletedAt is null`, { type: QueryTypes.SELECT });
  //            points[i]["routePayment"]= routePayment[0];
  //         }
  //         console.log("points from payload.type === 66 and payload.subsciptionType === 67" , points);

  //         return responseService.OK(reply, {value: points, message: "Found university trips" });
  //      }

  //      if(request.payload.type === 66 && request.payload.subsciptionType === 68){
  //       let points = await models.sequelize.query(`select id, routeName, companyId
  //           from buses_locations
  //           where id in(select bus_location_id from buses_locations_points where pointId= ${request.payload.endPoint})
  //           and deletedAt is null
  //         `, { type: QueryTypes.SELECT });
  //         for(let i= 0; i < points.length; i++){
  //           let route = await models.sequelize.query(`
  //           SELECT pointId, p.point,p.lat,p.long
  //           from buses_locations_points b, points p
  //           where bus_location_id= ${points[i].id}
  //           and b.pointId = p.id
  //           and b.deletedAt is null
  //             `, { type: QueryTypes.SELECT });
  //             console.log('points uni sub ',points);
  //           let routePayment = await models.sequelize.query(`SELECT * from routes_payment WHERE routeId = ${points[i].id} and deletedAt is null`, { type: QueryTypes.SELECT });
  //            points[i]["routePayment"]= routePayment[0];
  //            points[i]["routePoints"]= route;
  //         }
  //         console.log("points from payload.type === 66 and payload.subsciptionType === 68" , points);
  //         return responseService.OK(reply, {value: points, message: "Found university routes" });
  //      }
  //    } catch (e) {
  //     console.log(e)
  //     return responseService.InternalServerError(reply, e);
  //    }
  // },

  getSearchTrips: async (request, reply) => {
    let language = request.headers.language;
    try {

      // let tripDays = await models.sequelize.query(`
      //     SELECT id, day, tripId, td.from as fromH, td.to as toH, (select name from trips t where t.id = td.tripId) tripName,
      //     (SELECT routeName from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) routName, (SELECT id from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) routeId,
      //     (SELECT startPoint from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) startPoint,
      //     (SELECT endPoint from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) endPoint
      //     from allenap_bus.trips_days td
      //     where day = '${request.payload.day}'
      //     and tripId in (SELECT id from allenap_bus.trips where busRouteId in 
      //                     (SELECT id from allenap_bus.buses_locations where startPoint =${request.payload.startPoint} and endPoint =${request.payload.endPoint} ) )
      //     `, { type: QueryTypes.SELECT });

      // if (tripDays.length == 0) {
      let tripDays = await models.sequelize.query(`
        SELECT id, day, tripId, td.from as fromH, td.to as toH, (select name from trips t where t.id = td.tripId) tripName,
        (SELECT routeName from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) routName, (SELECT id from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) routeId,
        (SELECT startPoint from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) startsPoint,
          (SELECT endPoint from buses_locations where id = (SELECT busRouteId from trips t where t.id = td.tripId) ) endsPoint
        from allenap_bus.trips_days td
        where day = '${request.payload.day}' 
        and tripId in (SELECT id from allenap_bus.trips where busRouteId in 
                        (
                            SELECT bl.id
        FROM buses_locations bl
        INNER JOIN buses_locations_points blp1 ON bl.id = blp1.bus_location_id
        INNER JOIN buses_locations_points blp2 ON bl.id = blp2.bus_location_id
        WHERE blp1.pointId = ${request.payload.startPoint} AND blp2.pointId = ${request.payload.endPoint}
        OR (bl.startPoint = ${request.payload.startPoint} and blp1.pointId = ${request.payload.endPoint} and blp2.pointId = ${request.payload.endPoint})
        OR (bl.endPoint = ${request.payload.endPoint} and blp1.pointId = ${request.payload.startPoint} and blp2.pointId = ${request.payload.startPoint}) ) 
                      )              
          `, { type: QueryTypes.SELECT });
      // }

      console.log("tripDays------",tripDays)
      for(let i = 0 ; i < tripDays.length; i++){
        let routePoints = await models.sequelize.query(`SELECT pointId, p.point,p.lat,p.long
                              from buses_locations_points b, points p
                              where bus_location_id= ${tripDays[i].routeId}
                              and b.pointId = p.id
                              and b.deletedAt is null
                    `, { type: QueryTypes.SELECT });
                    tripDays[i]["routePoints"]= routePoints;
                   
             console.log("routePoints------",routePoints)
             let startPoint = await models.sequelize.query(`SELECT id, p.point,p.lat,p.long
             from points p
             where id= ${tripDays[i].startsPoint}
   `, { type: QueryTypes.SELECT });
   tripDays[i]["startPoint"]= startPoint[0];

   let endPoint = await models.sequelize.query(`SELECT id, p.point,p.lat,p.long
             from points p
             where id= ${tripDays[i].endsPoint}
   `, { type: QueryTypes.SELECT });
   tripDays[i]["endPoint"]= endPoint[0];
                                let routePayment = await models.sequelize.query(`SELECT * from routes_payment WHERE routeId = ${tripDays[i].routeId} and deletedAt is null`, { type: QueryTypes.SELECT });
                                tripDays[i]["routePayment"]= routePayment[0];

             console.log("routePayment------",routePayment)


          let days = await models.sequelize.query(`select * from trips_days where tripId= ${tripDays[i].tripId}
              `, { type: QueryTypes.SELECT });
              tripDays[i]["days"]= days;

             console.log("days------",days)


      }

      return responseService.OK(reply, { value: tripDays, message: "Found trips" });

    } catch (e) {
      console.log(e)
      return responseService.InternalServerError(reply, e);
    }
  },

  reserveDates: async (request, reply) => {
    let transaction;
    let created = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      payload.name= "Student reservation"

      for(let i= 0; i <payload.dates.length; i++){
        let found= await models.sequelize.query(`
        SELECT id, \`day\`, \`from\`, \`to\`, count
        from trips_days
        where \`day\`= '${payload.dates[i].day}'
        and \`from\`= '${payload.dates[i].from}'
        and \`to\`= '${payload.dates[i].to}'
        and tripId in (select id from trips where busRouteId= ${payload.busRouteId})
        and deletedAt is null
    `, { type: QueryTypes.SELECT });
        if(found.length === 0){
          let getCompany= await models.buses_locations.findOne({where: {id: payload.busRouteId}});
          console.log(getCompany)
          payload.companyId= getCompany.companyId;
          created = await models.trips.create(payload, {transaction});
          payload.dates[i].tripId= created.id;
          await models.trips_days.create(payload.dates[i], {transaction});
        }else{
          await models.trips_days.update({count: found[0].count + 1}, {where: {id: found[0].id}}, { transaction });
        }

      }
      await transaction.commit();
      return responseService.OK(reply, { value: 1, message: 'Reservation done successfully' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
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


