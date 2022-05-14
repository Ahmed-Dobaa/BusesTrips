const path = require('path');
const models = require(path.join(__dirname, '../models/index'));
const _enum = require(path.join(__dirname, '../services/enum'));
const { QueryTypes } = require('sequelize');


module.exports = {
    leftMenu : async (userData) =>{
      let menu = [];
      let users = [];
      let management = [];
      let customers = [];


      const mainScreens = await models.main_screens.findAll();
      const leftMenu = await models.sequelize.query(`SELECT r.id, permissionId, permissionName, lookupDetailName as permissionTypeName, permissionType,
      p.permissionChildId, (select permissionName from permissions s where s.id = p.permissionChildId) screenName, icon, relatedTo,
      url
      FROM role_permissions r, permissions p, lookup_details l
      where r.roleId = ${userData.role}
      and p.permissionType = ${_enum.SCREEN}
      and r.permissionId = p.id
      and permissionType = l.id
      and r.deletedAt is null `, { type: QueryTypes.SELECT });

      for(let i = 0; i < leftMenu.length; i++){

          if(leftMenu[i].relatedTo === null){
            menu.push({
              name: leftMenu[i].permissionName,
              icon: leftMenu[i].icon,
              url: leftMenu[i].url
            })
          }

          if(leftMenu[i].relatedTo === 2){

                users.push({
                  name: leftMenu[i].permissionName,
                  icon: leftMenu[i].icon,
                  url: leftMenu[i].url
                })
              }

          if(leftMenu[i].relatedTo === 3){
                management.push({
                  name: leftMenu[i].permissionName,
                  icon: leftMenu[i].icon,
                  url: leftMenu[i].url
                })
          }


        if(leftMenu[i].relatedTo === 8){
          customers.push({
            name: leftMenu[i].permissionName,
            icon: leftMenu[i].icon,
            url: leftMenu[i].url
        })
       }


      }

      if(users.length != 0){
        menu.push({
          name: 'Users',
          icon: mainScreens[0].mainScreenIcon,
          children: users
        })
      }

      if(management.length != 0){
        menu.push({
          name: 'Management',
          icon: mainScreens[2].mainScreenIcon,
          children: management
        })
      }
      if(customers.length != 0){
        menu.push({
          name: mainScreens[3].mainTitleName,
          icon: mainScreens[3].mainScreenIcon,
          children: customers
        })
      }

      return menu;
    }
}
