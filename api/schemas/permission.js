const Joi = require('joi');

module.exports = {

  getButtonsBasedScreen: {
    payload: {
      screenId: Joi.array().required()
    }
  },

  createPermission: {
    payload: {
      permissionName: Joi.string().required(),
      permissionType: Joi.number().valid(1, 2).required(),
      permissionChildId: Joi.number().allow(null, '').empty().optional(),
      icon: Joi.string().allow(null, '').empty().optional(),
      relatedTo: Joi.number().valid(2, 3).allow(null, '').empty().optional(),
    	url: Joi.string().allow(null, '').empty().optional()
    }
  }

};
