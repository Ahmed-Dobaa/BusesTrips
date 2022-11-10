module.exports = {
  database: 'sql5529114', //ucxzone_ucxz //'sql5431252', //'ucxzone_ucxz',//'ucxzone_ucxz', //'sql5431252', //
  username: 'sql5529114', //ucxzone_remote//'sql5431252', //'ucxzone_ucxz',//'sql5431252', //'ucxzone_remote',  //'sql5431252', //
  password: 'ArsvtyCUD3', //wW4Fds9v //'JmeY3URIRj', //'JmeY3URIRj', //'JmeY3URIRj', //
  host: 'sql5.freesqldatabase.com', //localhost //'sql5.freemysqlhosting.net', //'localhost', //'localhost', //'sql5.freemysqlhosting.net', //
  port: 3306,
  dialect: 'mysql',
  debug: true,
  sync: false,
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
