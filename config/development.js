const fs = require("fs");
const path = require("path");

module.exports = {
  frontEnd: { host: "http://localhost/frontEnd" },
  connection: {
    host: "allenapp.com", // 'localhost', //,
    port: process.env.PORT || 2051,

    tls: {
      key: fs.readFileSync(path.join(__dirname,'./key.pem')),
      cert: fs.readFileSync(path.join(__dirname,'./cert.pem')),
    },
  },
  joi: {
    allowUnknown: true,
    abortEarly: false,
  },
  database: {
    database: "allenap_bus", //'sql5529114', //'sql5490974', //
    username: "allenap_bus", //'sql5529114', //'allenap_bus', //'sql5490974', //
    password: "x7bw4ROf9dUT", //'ArsvtyCUD3', //8pjHfFzZEY',
    host: "localhost", //'sql5.freesqldatabase.com', //sql5.freemysqlhosting.net',
    port: 3306,
    dialect: "mysql",
    debug: true,
    sync: false,
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  jwt: {
    TokenTtl: "1d",
    stayLoggedInTokenTtl: "30d",
    authKey: "o12omucSlk7maWgbsAzSuG6eDlrPjpRb",
  },
  mailing: {
    host: "smtp.gmail.com",
    port: 465, // 587
    secure: true, // true for 465, false for other ports
    from: "Buses Trips",
    subjects: { activationMail: "Activation Mail" },
    auth: {
      user: "buses.trips@gmail.com", // generated ethereal user
      pass: "buses@12345", // generated ethereal password
    },
  },
};
