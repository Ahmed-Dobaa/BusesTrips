'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../../models/index'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
const trips = require('../trips');

module.exports = {
   
    reservation: async (request, reply) => {
        try {
          trips = await models.sequelize.query(`SELECT r.id,r.userId customerId,r.tripId,
          (SELECT tripId FROM single_trips s WHERE s.id = r.tripId) tripDayId, 
          (SELECT tripId FROM trips_days td WHERE td.id = tripDayId) tripIdR, 
          (SELECT name FROM trips t WHERE t.id = tripIdR ) tripName, 
          (SELECT name from customers c WHERE c.id = r.userId) customerName, 
          (SELECT email from customers c WHERE c.id = r.userId) email,
           (SELECT phoneNumber from customers c WHERE c.id = r.userId  AND deletedAt = null) phoneNumber from reservation r;`);
          return responseService.OK(reply, { value: trips, message: 'Reservations List' });
        }
        catch (e) {
          return responseService.InternalServerError(reply, e);
        }
    },

    updateReservation: async(request,reply)=>{
        const { payload } = request;
        transaction = await models.sequelize.transaction();
        try{
          
            let reservation =  await models.reservation.update(payload, {where: {id: payload.id }}, {transaction});
            
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
            return responseService.OK(reply, {value: deleted, message: 'This Point deleted successfully' });
    
          } catch (error) {
            if(transaction) {
              await transaction.rollback();
            }
          return responseService.InternalServerError(reply, error);
         }
      }

}