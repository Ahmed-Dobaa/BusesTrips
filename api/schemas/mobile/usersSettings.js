const Joi = require('joi');

module.exports = {
  updateUserSettings: {
    payload: {
      currency: Joi.number().allow(null).empty().optional(),
      lang: Joi.number().allow(null).empty().optional(),
      emailNotification: Joi.number().allow(null).empty().optional(),
      pushNotification: Joi.number().allow(null).empty().optional()
    }
  }


};
