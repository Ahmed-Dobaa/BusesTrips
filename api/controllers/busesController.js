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

  createBuses: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
        if("id" in payload){
          if(payload.id === null){  // create new bus
            const plateNumber = await models.buses.findAll({where: {busPlateNumber: payload.busPlateNumber}});
           console.log(plateNumber)
            if(_.isEmpty(plateNumber)){
              console.log("true")
              await models.buses.create(payload, {transaction});
            }else{
              console.log("false")
              await transaction.rollback();
              return Boom.notAcceptable(`This bus plate number '${payload.busPlateNumber}' alreadey registered`);
            }
          }else{
            await models.buses.update(payload, {where: {id: payload.id }}, {transaction});
          }
        }else{
           await transaction.rollback();
           return Boom.notAcceptable("The Id is required");
        }

      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Buses updated successfully' });
    }
    catch (e) {
      console.log(e)
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getBuses: async (request, reply) => {
    let language = request.headers.language;
    let buses = null;
     try {
      buses = await models.sequelize.query(` SELECT id, busType,
                            (select lookupDetailName from lookup_details l where l.id = busType) busTypeName,
                            seatsStructure,
                            (select lookupDetailName from lookup_details l where l.id = seatsStructure) seatsStructureName,
                            busPlateNumber, driverId,
                            (select name from companies_staff s where s.id = driverId) driverName,
                            supervisorId,
                            (select name from companies_staff s where s.id = supervisorId) supervisorName,
                            busSeatsNumber, companyId
                            FROM buses
                            where companyId = ${request.params.companyId}
                            and deletedAt is null
                            `, { type: QueryTypes.SELECT });

       return responseService.OK(reply, {value: buses, message: "Company Buses" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  deleteBus: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();

        const deletedStaff = await models.buses.destroy({where: {id: request.params.id }});

        await transaction.commit();
        return responseService.OK(reply, {value: deletedStaff, message: 'This bus deleted successfully' });

      } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  }

}


