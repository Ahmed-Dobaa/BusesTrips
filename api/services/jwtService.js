'use strict';
const config = require('config');
const JWT = require('jsonwebtoken');
const Boom = require('boom');

module.exports = {
  generateToken: (userId, companyId, roleId) =>{

    let token =  JWT.sign(
         { userId: userId, companyId: companyId, roleId: roleId},
        'defaultsecrete',
         {expiresIn: '1d'})
    return token;
},
verifyToken: (req) => {
  try {
    const { authorization } = req.headers;

    if(!authorization){
     return 'Unauthorized';
    }
      var decode = JWT.verify(authorization, 'defaultsecrete');
      req.user = { userId: decode.userId, roleId: decode.roleId, companyId: decode.companyId }
      return 'Authorized';

  } catch (error) {
    return 'Unauthorized';
  }
},
  generateUserAccessToken: function (userData = {}, secretKey ,stayloggedIn = false, userAgent) {
    const options = {
      expiresIn: stayloggedIn ? config.jwt.stayLoggedInTokenTtl : config.jwt.TokenTtl,
      // issuer: JSON.stringify(userAgent)
    };

    return JWT.sign(userData, secretKey, options);
  },
  generateCustomerAccessToken: function (userData = {}, secretKey , userAgent) {
    const options = {
      expiresIn:  config.jwt.TokenTtl,
    };
    return JWT.sign(userData, secretKey, options);
  },
  verifyResetPasswordToken: function (token) {
    return JWT.verify(token, config.jwt.authKey);
  }
};
