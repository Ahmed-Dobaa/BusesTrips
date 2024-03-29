'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');

module.exports = {

  createStudentDates: async (request, reply) => {
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      console.log("payload",payload);
      for (let i = 0; i < payload.length; i++) {
        const date = payload[i];
        console.log("el",date);
        if(date.id === null){
         await models.student_dates.create(date, {transaction});
       }else{
         await models.student_dates.update(date, {where: {id: date.id }}, {transaction});
       }
      }

      await transaction.commit();
      return responseService.OK(reply, { value: payload, message: 'Student dates updated successfully' });
    }
    catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getStudentDates: async (request, reply) => {
    let language = request.headers.language;
    let dates = null;
     try {
         dates = await models.sequelize.query(`SELECT * from student_dates WHERE student_dates.student_id = ${request.params.studentId} and deletedAt is null `, { type: QueryTypes.SELECT });

       return responseService.OK(reply, {value: dates, message: "Student Dates" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },



}


