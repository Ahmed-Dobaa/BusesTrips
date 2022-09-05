const Joi = require('joi');

module.exports = {
  payload: {
    phoneNumber: Joi.string().required(),
    password: Joi.string().required(),
    stayLoggedIn: Joi.boolean().default(false),
    signature: Joi.string().optional()
  }
};
