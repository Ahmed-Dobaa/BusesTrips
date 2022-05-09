'use strict';

const path = require('path');

const lookupDetailsController = require('./controllers/lookup_details');
const authenticationController = require('./controllers/authenticationController');
const usersController = require('./controllers/userController');
const rolesController = require('./controllers/rolesController');
const permissionsController = require('./controllers/permissionsController');

///////////// web schema
const registrationSchema = require('./schemas/registration.js');
const loginSchema = require('./schemas/login.js');
const userSchema = require('./schemas/user.js');
const rolesSchema = require('./schemas/roles');
const permissionsSchema = require('./schemas/permission');

module.exports = [
  {
    method: 'GET',
    path: '/{param*}',
    options: {
      auth: false,
      handler: {
        directory: {
          path: path.join(__dirname, '../', 'public'),
          redirectToSlash: true,
          index: ['index.html']
        }
      }
    }
  },
  {
    path: '/web/getLookupDetailBasedMaster/{masterId}',
    method: 'GET',
    options: {
      description: 'getLookupDetailBasedMaster',
      auth: false,
      handler: lookupDetailsController.getLookupDetailBasedMaster
    }
  },
  {
    path: '/mob/getLookupDetailBasedMaster/{masterId}',
    method: 'GET',
    options: {
      description: 'getLookupDetailBasedMaster',
      auth: false,
      handler: lookupDetailsController.getLookupDetailBasedMaster
    }
  },
  {
    path: '/web/register',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      plugins: { 'hapi-geo-locate': { enabled: true, fakeIP: '41.46.64.133' } },
      description: 'Register',
      auth: false,
      validate: registrationSchema,
      handler: authenticationController.registerAdmin
    }
  },
  {
    path: '/web/activateUser',
    method: 'post',
    options: {
      description: 'Activate user account',
      auth: false,
      validate: userSchema.activeUser,
      handler: authenticationController.activateUser
    }
  },
  {
    path: '/web/login',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Login',
      validate: loginSchema,
      auth: false,
      handler: authenticationController.login
    }
  },
  {
    path: '/web/forgetPassword',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Send email to reset the password',
      validate: userSchema.forgetPassword,
      auth: false,
      handler: authenticationController.forgetPassword
    }
  },
  {
    path: '/web/resetPassword',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Reset password and enter a new one',
      validate: userSchema.resetPassword,
      auth: false,
      handler: authenticationController.resetPassword
    }
  },
  {
    path: '/web/getUsers',
    method: 'GET',
    options: {
      description: 'get all users',
      auth: false,
      handler: usersController.getUsers
    }
  },
  {
    path: '/web/updateUserStatus/{userId}',
    method: 'PUT',
    options: {
      payload: { allow: ['application/json'], },
      description: 'update user status',
      validate: userSchema.updateUserStatus,
      auth: false,
      handler: usersController.updateUserStatus
    }
  },
  {
    path: '/web/updateUserRole/{userId}',
    method: 'PUT',
    options: {
      payload: { allow: ['application/json'], },
      description: 'update user role',
      validate: userSchema.updateUserRole,
      auth: false,
      handler: usersController.updateUserRole
    }
  },
  {
    path: '/web/deleteUser/{userId}',
    method: 'DELETE',
    options: {
      description: 'delete user',
      auth: false,
      handler: usersController.deleteUser
    }
  },
  {
    path: '/web/updateUser/{userId}',
    method: 'PUT',
    options: {
      payload: { allow: ['application/json'], },
      description: 'update user',
      validate: userSchema.updateUser,
      auth: false,
      handler: usersController.updateUser
    }
  },
  {
    path: '/web/createRoleAndItsPermissions',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'create a new role',
      validate: rolesSchema.createRoleAndItsPermissions,
      auth: false,
      handler: rolesController.createRoleAndItsPermissions
    }
  },
  {
    path: '/web/getRoles',
    method: 'GET',
    options: {
      description: 'get all system roles',
      auth: false,
      handler: rolesController.getRoles
    }
  },
  {
    path: '/web/deleteRole/{roleId}',
    method: 'DELETE',
    options: {
      description: 'delete a specific role',
      auth: false,
      handler: rolesController.deleteRole
    }
  },
  {
    path: '/web/updateRoleAndItsPermission',
    method: 'PUT',
    options: {
      payload: { allow: ['application/json'], },
      description: 'update an existed role',
      // validate: rolesSchema.updateRoleAndItsPermission,
      auth: false,
      handler: rolesController.updateRoleAndItsPermission
    }
  },
  {
    path: '/web/getPermissions',
    method: 'GET',
    options: {
      description: 'get all system permissions',
      auth: false,
      handler: permissionsController.getPermissions
    }
  },
  {
    path: '/web/deletePermission/{permissionId}',
    method: 'DELETE',
    options: {
      description: 'delete a specific permission',
      auth: false,
      handler: permissionsController.deletePermission
    }
  },
  {
    path: '/web/screenActions',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'get buttons of the screen',
      validate: permissionsSchema.getButtonsBasedScreen,
      auth: false,
      handler: permissionsController.screenActions
    }
  },
  {
    path: '/web/createPermission',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new permission',
      validate: permissionsSchema.createPermission,
      auth: false,
      handler: permissionsController.createPermission
    }
  },
];
