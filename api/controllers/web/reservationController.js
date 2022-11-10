'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../../models/index'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
const { QueryTypes } = require('sequelize');


module.exports = {
   
    reservation: async (request, reply) => {
        let language = request.headers.language;
        let reservations=null;
        try {
         console.log("inside...........");
          reservations = await models.sequelize.query(`SELECT r.id,r.userId customerId,r.tripId,
          (SELECT name FROM trips t WHERE t.id = (SELECT tripId FROM trips_days td WHERE td.id = (SELECT tripId FROM single_trips s WHERE s.id = r.tripId) ) ) tripName, 
              (SELECT name from customers c WHERE c.id = r.userId) customerName, 
              (SELECT email from customers c WHERE c.id = r.userId) email,
               (SELECT phoneNumber from customers c WHERE c.id = r.userId  AND deletedAt is null) phoneNumber from reservation r`,{ type: QueryTypes.SELECT });
           console.log("reservations--------------",reservations);
          return responseService.OK(reply, { value: reservations, message: 'Reservations List' });
        }
        catch (e) {
            console.log("errorrr---",e);
          return responseService.InternalServerError(reply, e);
        }
    },

    updateReservation: async(request,reply)=>{
        const { payload } = request;
        console.log("payload------",payload);
        let transaction;
        try{
         transaction = await models.sequelize.transaction();
          console.log("inside------");
            let reservation =  await models.reservation.update(payload, {where: {id: payload.id }}, {transaction});
            console.log("rrese----",reservation);
            await transaction.commit();
            return responseService.OK(reply, {value: reservation, message: 'This reservation updated successfully' });
        }
        catch(err){
            if(transaction) {
                await transaction.rollback();
              }
            return responseService.InternalServerError(reply, error);
        }
    },

    deleteReservation: async (request, reply) => {
        let transaction;
        try {
          transaction = await models.sequelize.transaction();
    
            const deleted = await models.reservation.destroy({where: {id: request.params.id }});
    
            await transaction.commit();
            return responseService.OK(reply, {value: deleted, message: 'This reservation deleted successfully' });
    
          } catch (error) {
            if(transaction) {
              await transaction.rollback();
            }
          return responseService.InternalServerError(reply, error);
         }
      }

}