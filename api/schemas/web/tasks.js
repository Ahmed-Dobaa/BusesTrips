const Joi = require('joi');

module.exports = {
  acceptTask: {
    payload: {
      customerId: Joi.number().required(),
      taskId: Joi.number().required()
    }
  },
  submitTask: {
    payload: {
      customerId: Joi.number().required(),
      taskId: Joi.number().required(),
      typeId: Joi.number().required()
    }
  },
  changeUploadedTaskStatus: {
    payload: {
      customerId: Joi.number().required(),
      taskId: Joi.number().required()
    }
  }


};
