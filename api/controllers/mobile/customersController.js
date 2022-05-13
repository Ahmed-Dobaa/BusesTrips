'user strict';

const path = require('path');
const _ = require('lodash');
const Boom = require('boom');
const fs = require('fs');
const moment = require('moment');

const models = require(path.join(__dirname, '../../models/index'));
const Mailer = require(path.join(__dirname, '../../services/sendEmailService'));
const userService = require(path.join(__dirname, '../../services/userService'));
const responseService = require(path.join(__dirname, '../../services/responseService'));
const helperService = require(path.join(__dirname, '../../services/helperService'));
const _enum = require(path.join(__dirname, '../../services/enum'));
const { QueryTypes } = require('sequelize');

module.exports = {
  getAllCustomers: async function (request, reply) {
    let language = request.headers.language;
    try {
        const customer = await models.sequelize.query(`select id, name, email, phoneNumber,
                (select lookupDetailName from lookup_details l where l.id = active) status
                from customers
                where deletedAt is null`, { type: QueryTypes.SELECT });
      return responseService.OK(reply, { value: customer, message: `All customers` });
    } catch (error) {
      return responseService.InternalServerError(reply, error);
    }
  }

};
