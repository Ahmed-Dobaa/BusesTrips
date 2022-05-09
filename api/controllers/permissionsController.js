'use strict';

const Boom = require('boom');
const path = require('path');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const models = require(path.join(__dirname, '../models/index'));
const errorService = require(path.join(__dirname, '../services/errorService'));
const responseService = require(path.join(__dirname, '../services/responseService'));
const helperService = require(path.join(__dirname, '../services/helperService'));
const _enum = require(path.join(__dirname, '../services/enum'));

module.exports = {

  getPermissions: async (request, reply) => {
    let language = request.headers.language;
    let transaction;
     try {
          transaction = await models.sequelize.transaction();
          const permissions = await models.sequelize.query(`select p.id, permissionName, permissionType, lookupDetailName permissionTypeName
                        from permissions p, lookup_details l
                        where permissionType = ${_enum.SCREEN}
                        and permissionType = l.id
                        and p.deletedAt is null`, { type: QueryTypes.SELECT });
              await transaction.commit();
          return responseService.OK(reply, {value: permissions, message: 'All permissions'});
     } catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
     }
  },

  screenActions: async (request, reply) => {
    let language = request.headers.language;
    let transaction;
    let { screenId } = request.payload;
    let buttons = [];
     try {
      transaction = await models.sequelize.transaction();
       for(let i = 0; i < screenId.length; i++){
            let screenActions = await models.sequelize.query(`select p.id, permissionName, permissionType, lookupDetailName permissionTypeName,
            permissionChildId, (select permissionName from permissions s where s.id = p.permissionChildId) screenName
            from permissions p, lookup_details l
            where permissionType = ${_enum.BUTTON} and permissionChildId = ${screenId[i]}
            and permissionType = l.id and p.deletedAt is null`, { type: QueryTypes.SELECT });
            if(!_.isEmpty(screenActions)){
              screenActions.forEach(element => {
                buttons.push(element);
              });
            }
       }
          await transaction.commit();
          return responseService.OK(reply, {value: buttons, message: 'All actions inside this screen'});
     } catch (e) {
      if(transaction) {
        await transaction.rollback();
      }
      return responseService.InternalServerError(reply, e);
     }
  },

  deletePermission: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    const { permissionId } = request.params;
    let deletedPermission = null;

    try {
      transaction = await models.sequelize.transaction();
      const foundPermission = await models.role_permissions.findOne({where : { id: permissionId }});

       if(_.isEmpty(foundPermission)){
        await transaction.rollback();
        const response = helperService.findMessage('NotFound');
        return Boom.notAcceptable('This item not found');
        // return responseService.NotAllowed(reply, response.message[language]);
       }
        deletedPermission = await models.role_permissions.destroy({where : { id: permissionId }});
        await transaction.commit();

        const response = helperService.findMessage('Deleted');
        return responseService.OK(reply, {value: deletedPermission, message: response.message[language] });
    } catch (error) {
        if(transaction) {
          await transaction.rollback();
        }
      return responseService.InternalServerError(reply, error);
     }
  },

  createPermission: async (request, reply) => {

    let language = request.headers.language;
    let transaction;
    let { payload } = request;
     try {

        transaction = await models.sequelize.transaction();
        await models.permissions.create(payload, { transaction });

        await transaction.commit();
        // const createdResponse = helperService.findMessage('RoleCreated');
        return responseService.OK(reply, { value: payload, message: 'Permission created successfully' });
     } catch (error) {
      if(transaction) {
        await transaction.rollback();
      }
         return responseService.InternalServerError(reply, error);
        }
  },

  getUserScreenToAccess: async (userData) => {
    let urls = [];
    try {
          const leftMenu = await models.sequelize.query(`SELECT r.id, permissionId, permissionName, lookupDetailName as permissionTypeName, permissionType,
          p.permissionChildId, (select permissionName from permissions s where s.id = p.permissionChildId) screenName, icon, relatedTo,
          url
          FROM role_permissions r, permissions p, lookup_details l
          where r.roleId = ${userData.role}
          and p.permissionType = ${_enum.SCREEN}
          and r.permissionId = p.id
          and permissionType = l.id
          and r.deletedAt is null `, { type: QueryTypes.SELECT });
          leftMenu.forEach(screen => {
          urls.push(screen.url);
          })
       return urls;
    } catch (error) {
         return responseService.InternalServerError(reply, error);
      }
  },

  getUserActionsInPage: async (userData) => {
    let actions = null;
    let arr = [];
    try {   /// screen id is a permssion id from permissions model
      const screens = await models.sequelize.query(`SELECT r.id, permissionId, permissionName, lookupDetailName as permissionTypeName, permissionType,
      p.permissionChildId, (select permissionName from permissions s where s.id = p.permissionChildId) screenName, icon, relatedTo,
      url, screenKey
      FROM role_permissions r, permissions p, lookup_details l
      where r.roleId = ${userData.role}
      and p.permissionType = ${_enum.SCREEN}
      and r.permissionId = p.id
      and permissionType = l.id
      and r.deletedAt is null `, { type: QueryTypes.SELECT });

      let canAccess = {};
     for(let x = 0; x < screens.length; x++){
     actions = await models.permissions.findAll({where: {permissionChildId: screens[x].permissionId, permissionType: _enum.BUTTON}});
     let obj = {};
     for(let i = 0; i < actions.length; i++){
      let foundAction = await models.role_permissions.findAll({where: {permissionId: actions[i].id, roleId: userData.role}});

      if(!_.isEmpty(foundAction)){
        obj[actions[i].permissionName] = true;
      }else{
        obj[actions[i].permissionName] = false;
       }
      }
      canAccess[screens[x].screenKey] = obj;
    }
     arr.push(canAccess);
     return arr;
    } catch (error) {
      //  return responseService.InternalServerError(reply, error);
    }
  }


};
