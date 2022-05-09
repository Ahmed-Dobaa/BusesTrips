const Joi = require('joi');

module.exports = {
  activeUser: {
    payload: {
      activationCode: Joi.string().required()
    }
  },

  updateUserStatus: {
    payload: {
      status: Joi.number().required()
    }
  },

  updateUserRole: {
    payload: {
      role: Joi.number().required()
    }
  },

  updateUser: {
    payload: {
      name: Joi.string().required(),
      email: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      role: Joi.number().required()
    }
  },

  forgetPassword: {
    payload: {
      email: Joi.string().required()
    }
  },

  resetPassword: {
    payload: {
      secret_code: Joi.string().required(),
      password: Joi.string().required()
    }
  }

};
