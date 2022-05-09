const Joi = require('joi');

module.exports = {

  createRoleAndItsPermissions: {
    payload: {
      name: Joi.required().empty(),
      roleId: Joi.required().empty(),
      permissionId: Joi.array().required()
    }
  }

};
