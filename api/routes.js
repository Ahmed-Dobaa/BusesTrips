'use strict';

const path = require('path');

const registrationSchema = require('./schemas/registration.js');
const activationSchema = require('./schemas/activation.js');
const loginSchema = require('./schemas/login.js');
const authenticationController = require('./controllers/authenticationController');

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
      validate: activationSchema,
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
  }

];
