'use strict';

const path = require('path');
const _ = require('lodash');
const models = require(path.join(__dirname, '../models/index'));
const jwtService = require(path.join(__dirname, '../services/jwtService'));
const errorService = require(path.join(__dirname, '../services/errorService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const { QueryTypes } = require('sequelize');
const Boom = require('boom');

module.exports = {

  createRoleAndItsPermissions: async (request, reply) => {
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    let roleId = null;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let createdRole = null;
      let rolePermissions = null;
      if(payload.roleId === null){  // create new role
        const foundRole = await models.roles.findOne({ where: { name: payload.name }});
        //// check if this role created before or not
        if(!_.isEmpty(foundRole)) {
          await transaction.rollback();
          return Boom.notAcceptable('This role existed');
          // return Boom.unauthorized(response.message[language])
          // return responseService.NotAllowed(reply, response.message[language]);
        }
         /// create role if not created before
        createdRole = await models.roles.create({name: payload.name}, {transaction});
        roleId = createdRole.id;
      }

      if(payload.roleId != null){
        const checkRole = await models.roles.findOne({ where: { id: payload.roleId }});
        if(_.isEmpty(checkRole)) {
          await transaction.rollback();
          return Boom.notAcceptable(`This role isn't found`);
          // return responseService.NotAllowed(reply, response.message[language]);
        }
        await models.roles.update({name: payload.name}, { where: { id: payload.roleId }});
        roleId = payload.roleId;
      }

      /// create permissions on this role
      for(let i = 0; i < payload.permissionId.length; i++){
        const permission = await models.permissions.findOne({where: { id: payload.permissionId[i]} }, {transaction});

        if(_.isEmpty(permission)){
          await transaction.rollback();
          return Boom.notAcceptable(`This permission isn't existed!`);
          // return responseService.NotAllowed(reply, response.message[language]);
        }

        const foundRolePermission = await models.role_permissions.findAll({where: { permissionId: payload.permissionId[i],
                                                                                         roleId: roleId} }, {transaction});
       if(_.isEmpty(foundRolePermission)){
        rolePermissions = {roleId: roleId, permissionId: payload.permissionId[i]}
        await models.role_permissions.create(rolePermissions, {transaction});
        }
      }

      const checkRolePermissions = await models.role_permissions.findAll({where: { roleId: roleId } }, {transaction});
      checkRolePermissions.forEach( async element => {
        if(!payload.permissionId.includes(element.permissionId)){
          await models.role_permissions.destroy({where : { permissionId : element.permissionId, roleId: roleId }});
        }
      })

      await transaction.commit();
      return responseService.OK(reply, { value: rolePermissions, message: 'Role created successfully' });
    }
    catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
    }
  },

  getRoles: async (request, reply) => {
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let permissions = null;
     try {
         const roles = await models.roles.findAll();
         console.log(roles.length)
         for( let i = 0; i < roles.length; i++){
          permissions = await models.sequelize.query(`SELECT r.id, permissionId, permissionName, lookupDetailName as permissionTypeName, permissionType,
             p.permissionChildId, (select permissionName from permissions s where s.id = p.permissionChildId) screenName
             FROM role_permissions r, permissions p, lookup_details l
             where r.roleId = ${roles[i].id}
             and r.permissionId = p.id
             and permissionType = l.id
             and r.deletedAt is null `, { type: QueryTypes.SELECT });
             roles[i].dataValues['permissions'] = permissions;
         }

          return responseService.OK(reply, {value: roles, message: "Roles and its permissions" });
     } catch (e) {
      return responseService.InternalServerError(reply, e);
     }
  },

  updateRoleAndItsPermission: async (request, reply) => {
    const authorization = await jwtService.verifyToken(request);
       if(authorization === 'Unauthorized'){
         return Boom.unauthorized('Unauthorized');
       }
    let language = request.headers.language;
    let transaction;
    try {
      transaction = await models.sequelize.transaction();
      const { payload } = request;
      let createdRole = null;
      // let rolePermissions = null;
      // const foundRole = await models.roles.findOne({ where: { name: payload.name }});
      //   //// check if this role created before or not
      //   if(!_.isEmpty(foundRole)) {
      //     await transaction.rollback();
      //     const response = helperService.findMessage('DuplicatedRole');
      //     return responseService.NotAllowed(reply, response.message[language]);
      //   }

        createdRole = await models.roles.update({name: payload.name}, {where: {id: payload.roleId}}, {transaction});
        console.log(createdRole)
    } catch (e) {
      console.log(e.errors[0])
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e.errors[0].message);
    }
  },

  deleteRole: async (request, reply) => {
    const authorization = await jwtService.verifyToken(request);
    if(authorization === 'Unauthorized'){
      return Boom.unauthorized('Unauthorized');
    }
    let language = request.headers.language;
    let transaction;
    const { roleId } = request.params;
    let roles = null;
    let deletedRole = null;

    try {
      transaction = await models.sequelize.transaction();
      roles = await models.sequelize.query(`SELECT (select count(*) from users where role = ${roleId}) userRoles
      `, { type: QueryTypes.SELECT });

      if(roles[0].userRoles === 0){

        deletedRole = await models.roles.destroy({where : { id: roleId }});
        await transaction.commit();

        return responseService.OK(reply, {value: deletedRole, message: 'This role deleted successfully' });
      }else{

        await transaction.rollback();

        return Boom.notAcceptable(`You can't delete this role`);
        // return responseService.NotAllowed(reply, response.message[language]);
      }
    } catch (error) {
  console.log(error)
      if(transaction) {
        await transaction.rollback();
      }

      return responseService.InternalServerError(reply, error);
     }
  }

}


