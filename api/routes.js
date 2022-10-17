'use strict';

const path = require('path');

const lookupDetailsController = require('./controllers/lookup_details');
const authenticationController = require('./controllers/authenticationController');
const usersController = require('./controllers/userController');
const rolesController = require('./controllers/rolesController');
const permissionsController = require('./controllers/permissionsController');
const companiesStaffController = require('./controllers/companiesStaffController');
const companyController = require('./controllers/companyController');
const busesController = require('./controllers/busesController');
const busesRoutesController = require('./controllers/busesLocationsController');
const tripsController = require('./controllers/trips');
const pointsController = require('./controllers/points');
const singleTripsController = require('./controllers/single_trips');

/////////////////// *** mobile controller *** ///////////////////////
const mobileAuthenticationController = require('./controllers/mobile/authenticationController');
const userSettingsController = require('./controllers/mobile/userSettingsController');
const customerController = require('./controllers/mobile/customersController');


/////////////////// *** mobile controller *** ///////////////////////
const webAuthenticationController = require('./controllers/web/authenticationController');

///////////// web schema
const registrationSchema = require('./schemas/registration.js');
const loginSchema = require('./schemas/login.js');
const userSchema = require('./schemas/user.js');
const rolesSchema = require('./schemas/roles');
const permissionsSchema = require('./schemas/permission');
const companySchema = require('./schemas/company');

/////////////// mobile schema
const mobileRegistrationSchema = require('./schemas/mobile/registration');
const mobileLoginSchema = require('./schemas/mobile/login');
const customerSchema = require('./schemas/mobile/customer');
const usersSettingsSchema = require('./schemas/mobile/usersSettings');

const webLoginSchema = require('./schemas/web/login');

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
    path: '/api/getLookupDetailBasedMaster/{masterId}',
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
  {
    path: '/web/getAllCustomers',
    method: 'GET',
    options: {
      description: 'Get all customers',
      auth: false,
      handler: customerController.getAllCustomers
    }
  },
  {
    path: '/web/createStaff',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new staff',
      auth: false,
      handler: companiesStaffController.createStaff
    }
  },
  {
    path: '/mob/driverLogin',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new staff',
      auth: false,
      handler: companiesStaffController.driverLogin
    }
  },
  {
    path: '/web/companyStaff/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company staff',
      auth: false,
      handler: companiesStaffController.getCompanyStaff
    }
  },
  {
    path: '/web/staff/{id}',
    method: 'DELETE',
    options: {
      description: 'delete a specific one from staff',
      auth: false,
      handler: companiesStaffController.deleteOneStaff
    }
  },
  {
    path: '/web/getCompanies',
    method: 'GET',
    options: {
      description: 'Get all companies',
      auth: false,
      handler: companyController.getCompanies
    }
  },
  {
    path: '/web/createCompany',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new company',
      auth: false,
      validate: companySchema.createCompany,
      handler: companyController.createCompany
    }
  },
  {
    path: '/web/deleteCompany/{id}',
    method: 'DELETE',
    options: {
      description: 'delete company',
      auth: false,
      handler: companyController.deleteCompany
    }
  },
  {
    path: '/web/createBuses',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses',
      auth: false,
      // validate: companySchema.createCompany,
      handler: busesController.createBuses
    }
  },
  {
    path: '/web/getBuses/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company buses',
      auth: false,
      handler: busesController.getBuses
    }
  },
  {
    path: '/web/deleteBus/{id}',
    method: 'DELETE',
    options: {
      description: 'delete bus',
      auth: false,
      handler: busesController.deleteBus
    }
  },
  {
    path: '/web/createBusesRoutes',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: busesRoutesController.createBusesRoutes
    }
  },
  {
    path: '/web/getBusesRoutes/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company buses routes',
      auth: false,
      handler: busesRoutesController.getBusesRoutes
    }
  },
  {
    path: '/web/deleteBusRoute/{id}',
    method: 'DELETE',
    options: {
      description: 'delete bus route',
      auth: false,
      handler: busesRoutesController.deleteBusRoute
    }
  },
  {
    path: '/web/createPoints',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: pointsController.createPoints
    }
  },
  {
    path: '/api/reserveDates',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: pointsController.reserveDates
    }
  },
  {
    path: '/api/getPointsBasedTripType/{tripPoint}',
    method: 'GET',
    options: {
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: pointsController.getPointsBasedTripType
    }
  },
  {
    path: '/api/searchTrips',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: pointsController.getSearchTrips
    }
  },
  {
    path: '/api/reservation',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new buses routes',
      auth: false,
      // validate: companySchema.createCompany,
      handler: pointsController.reservation
    }
  },
  {
    path: '/web/getPoints/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company buses routes',
      auth: false,
      handler: pointsController.getPoints
    }
  },
  {
    path: '/web/deletePoints/{id}',
    method: 'DELETE',
    options: {
      description: 'delete bus route',
      auth: false,
      handler: pointsController.deletePoints
    }
  },
  {
    path: '/web/createTrip',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new trips',
      auth: false,
      // validate: companySchema.createCompany,
      handler: tripsController.createTrip
    }
  },
  {
    path: '/web/trips/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company trips',
      auth: false,
      handler: tripsController.getTrips
    }
  },
  {
    path: '/web/getTripsBasedRoutes/{routeId}',
    method: 'GET',
    options: {
      description: 'Get all company trips',
      auth: false,
      handler: tripsController.getTripsBasedRoute
    }
  },
  {
    path: '/web/trips/{id}',
    method: 'DELETE',
    options: {
      description: 'delete trip',
      auth: false,
      handler: tripsController.deleteTrip
    }
  },
  {
    path: '/web/createSingleTrip',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Create new trips',
      auth: false,
      // validate: companySchema.createCompany,
      handler: singleTripsController.createSingleTrip
    }
  },
  {
    path: '/web/singleTrips/{companyId}',
    method: 'GET',
    options: {
      description: 'Get all company trips',
      auth: false,
      handler: singleTripsController.singleTrips
    }
  },
  // {
  //   path: '/web/getTripsBasedRoutes/{routeId}',
  //   method: 'GET',
  //   options: {
  //     description: 'Get all company trips',
  //     auth: false,
  //     handler: tripsController.getTripsBasedRoute
  //   }
  // },
  {
    path: '/web/singleTrip/{id}',
    method: 'DELETE',
    options: {
      description: 'delete trip',
      auth: false,
      handler: singleTripsController.deleteSingleTrip
    }
  },


  //////////////////****************************////////////////////
  ///////********** MOBILE APIs **************************/
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
    path: '/mob/signUp',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      plugins: { 'hapi-geo-locate': { enabled: true, fakeIP: '41.46.64.133' } },
      description: 'register new customer',
      auth: false,
      validate: mobileRegistrationSchema,
      handler: mobileAuthenticationController.signUp
   }
  },
  {
    path: '/web/addCustomer',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      plugins: { 'hapi-geo-locate': { enabled: true, fakeIP: '41.46.64.133' } },
      description: 'register new customer',
      auth: false,
      // validate: mobileRegistrationSchema,
      handler: customerController.addCustomer
   }
  },
  {
    path: '/web/deleteCustomer/{id}',
    method: 'DELETE',
    options: {
      description: 'delete customer',
      auth: false,
      handler: customerController.deleteCustomer
    }
  },
  {
    path: '/mob/signIn',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'login',
      validate: mobileLoginSchema,
      auth: false,
      handler: mobileAuthenticationController.signIn
    }
  },
  {
    path: '/mob/activateUser',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'activate customer account using code from email',
      validate: customerSchema.activeCustomer,
      auth: false,
      handler: mobileAuthenticationController.activateAccount
    }
  },
  {
    path: '/mob/forgetPassword',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Send email to reset the password',
      validate: customerSchema.forgetPassword,
      auth: false,
      handler: mobileAuthenticationController.forgetPassword
    }
  },
  {
    path: '/mob/resetPassword',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'Reset password and enter a new one',
      validate: customerSchema.resetPassword,
      auth: false,
      handler: mobileAuthenticationController.resetPassword
    }
  },
  {
    path: '/mob/userSettings/{customerId}',
    method: 'GET',
    options: {
      description: 'Get user settings',
      auth: false,
      handler: userSettingsController.userSettings
    }
  },
  {
    path: '/mob/userSettings/{customerId}',
    method: 'PUT',
    options: {
      payload: { allow: ['application/json'], },
      description: 'update category and its sub categories',
      validate: usersSettingsSchema.updateUserSettings,
      auth: false,
      handler: userSettingsController.updateUserSettings
    }
  },
  {
    path: '/api/signUp',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      plugins: { 'hapi-geo-locate': { enabled: true, fakeIP: '41.46.64.133' } },
      description: 'register new customer',
      auth: false,
      validate: mobileRegistrationSchema,
      handler: webAuthenticationController.signUp
   }
  },
  {
    path: '/api/setCustomerServiceType/{customerId}',
    method: 'Put',
    options: {
      payload: { allow: ['application/json'] },
      description: 'set customer service type',
      auth: false,
      handler: webAuthenticationController.setCustomerServiceType
   }
  },
  {
    path: '/api/addParentData',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      description: 'register new customer',
      auth: false,
      handler: webAuthenticationController.addParentData
   }
  },
  {
    path: '/api/addStudentData',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'] },
      description: 'register new customer',
      auth: false,
      handler: webAuthenticationController.addStudentData
   }
  },
  {
    path: '/api/getParentData/{customerId}',
    method: 'GET',
    options: {
      description: 'register new customer',
      auth: false,
      handler: webAuthenticationController.getParentData
   }
  },
  {
    path: '/api/getStudentData/{id}',
    method: 'GET',
    options: {
      description: 'register new customer',
      auth: false,
      handler: webAuthenticationController.getStudentData
   }
  },
  {
    path: '/api/signIn',
    method: 'POST',
    options: {
      payload: { allow: ['application/json'], },
      description: 'login',
      validate: webLoginSchema,
      auth: false,
      handler: webAuthenticationController.signIn
    }
  },
];
