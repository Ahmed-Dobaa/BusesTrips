const Joi = require('joi');

module.exports = {

  createCompany: {
    payload: {
      id: Joi.number().required().empty().allow(null),
      name: Joi.string().required(),
      email: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      password: Joi.string().optional().empty()
    }
  }

};
