'use strict';

const Boom = require('boom');
const path = require('path');
const models = require(path.join(__dirname, '../models/index'));
const _ = require('lodash');
const responseService = require(path.join(__dirname, '../services/responseService'));

module.exports = {
  getLookupDetailBasedMaster: async function (request, reply) {
    try {
        console.log(request.params.masterId);
      const lookup_details = await models.lookup_details.findAll({where: {lookupId: request.params.masterId}});
      return responseService.OK(reply, {value: lookup_details, message: 'Answer types'});
    } catch (error) {
     console.log(error)
     return responseService.InternalServerError(reply, error);
    }

  }
}

