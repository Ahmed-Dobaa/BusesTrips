const fs = require('fs')

module.exports = {
  frontEnd: { host: 'http://localhost/frontEnd' },
  connection: {
    host: 'allenapp.com',  // 'localhost', //,
    port: process.env.PORT || 2051,


tls: {
key: `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1auZcp4tV1oTVVXnh6hVgnspzeZKRClr6dL6PbcRHk+Gqcq7CHxQrZo37efF2Cg1sRQWO0UNmYb55GBdko2LDiaikKY6KMABsCXVSZc7o1gc/Cq2mEesnjyTjNRhZUN1ruY0UtGNjspQBT0Y4CB7l6KIh2OAXMdkxV0QqUXNDEnzvZRkerE1/hXL3HOr+WE2J7WuZuOZpM3/qZ3kKhdcgYwha3J8udyDOBYwLEKwYe215cl6JTwDZ/hq3Po+1BCsSeG5X/I989EEVpsn/d1cqWUctZFse/5/hXmE9SDjQy31x2A+Y6W/w3fSZGILMHBQ/WAekKChIUj5Rk3/hhxxAwIDAQABAoIBAQCIfhMLBgJ+35qkE7lQjnb5YEYnMqpUeoVmHBEhJXW5ACJNCqWJ2SgMjgyWXE2lNKJ/2Q4OlKEIZxHxEqITwXmH86Q7dQSIDYfGh5SFayd8xAfYCk0UYAzkFFxJRU5mSr69mG7qTNT510Fg51OhsP5iskA3BJf2LKWx8i53g5Bl/RjOBsOzsT/EHMVgOY87qe5r17JPdS4imrim/0RiHVqdXlEy1vAZRhCaN96wK3CIQroocORvJF8EQojOzZCC3G3ka6sBYe9nI/wkq7ldGQzuMNRpxTWa7qOa2z9Btlj3fp3Q+QjcJBfJ2e0JRJP/J8Fpub9Bu+ER25UnzFWweYg5AoGBAPHala2QW5KwRnVH1O/CwtuEZ56LJXfJ1BpOR8kVFj5MExpxBzu8xScKOjY55YYWicZ16kR38nWIqXiNq/TXMCaUu7FKq2fFTic7gzW5+i6h/7p0gyex6JbYdekSpQOxyI81nvf6C5adiA6BXrZei80wdIcbX8+Wrgfr4HY0G++1AoGBAOIrAbAhk6cAUZart2ZfAaWs1lsZ51lfsdYh5k+c3d4HVhh0H3KqLBvRcrilQq1kvbrdwZiUN6rKuOeshmv757cE3wEmBQeL+AX3uD3wJcVUBfHp67rAPTZOt5zCZsXU0krzbdgvMvp8XDBk9PQe3+HkvJ+NG0fH1fayAJvcoaDXAoGBAJeLOKilwMt8itmoJeQKLKDyKR9t3w9dNvs4u8Bi5yon7vxtgHPNB9g7j1g1FP3dF310m1NFuXYuKMqyMuJbB//UyHsB579BIYRxxPigTQR1W9EQerIfxzbl8ZQWq7FR7/LUTYTid+prUTqNk7RAL+dlik6yN2nS579s7JwEcNDVAoGAUpUVhrSb72zEXdnRm8WxGkej9Zvdx9qTWvcB26wRr1LKcx9jpEDS3k16MEXXtOyGAseaOxZTxT9EiQOMCb3ve/qBWzAAwiKvq64qTiN0BzuI+C5L7uLm9v+DN/AcCryNFOUSBNAnMyNZnioe70yevyMAZNnnTix/yhZw9nh3Y/0CgYA454gOVvrPQFIULDE2eLENmW5+KfNqP/sGYCXOxflqbKmnrEQcvwZHll2ykbTJnsp1jlEdT3H2EWc1EvSPLkZcjuBN3HFwQ7jzZgeuK4PlHQy3xvaD0OtMTvhEx71SAZ4lSoNPV9IU6v8kUe1N28H6vlf2riiwsUgOVu2UQggPUw==
-----END RSA PRIVATE KEY-----
`,
cert: `
-----BEGIN CERTIFICATE-----
MIIFNTCCBB2gAwIBAgISA+INeYxsxiWpCB4eTSEX5GTCMA0GCSqGSIb3DQEBCwUAMDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQDEwJSMzAeFw0yMjA5MDUxNzA1MDBaFw0yMjEyMDQxNzA0NTlaMBsxGTAXBgNVBAMTEHd3dy5hbGxlbmFwcC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDVq5lyni1XWhNVVeeHqFWCeynN5kpEKWvp0vo9txEeT4apyrsIfFCtmjft58XYKDWxFBY7RQ2ZhvnkYF2SjYsOJqKQpjoowAGwJdVJlzujWBz8KraYR6yePJOM1GFlQ3Wu5jRS0Y2OylAFPRjgIHuXooiHY4Bcx2TFXRCpRc0MSfO9lGR6sTX+Fcvcc6v5YTYnta5m45mkzf+pneQqF1yBjCFrcny53IM4FjAsQrBh7bXlyXolPANn+Grc+j7UEKxJ4blf8j3z0QRWmyf93VypZRy1kWx7/n+FeYT1IONDLfXHYD5jpb/Dd9JkYgswcFD9YB6QoKEhSPlGTf+GHHEDAgMBAAGjggJaMIICVjAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFI1i88vaaYDoAC4ZRkQJDw+69uUOMB8GA1UdIwQYMBaAFBQusxe3WFbLrlAJQOYfr52LFMLGMFUGCCsGAQUFBwEBBEkwRzAhBggrBgEFBQcwAYYVaHR0cDovL3IzLm8ubGVuY3Iub3JnMCIGCCsGAQUFBzAChhZodHRwOi8vcjMuaS5sZW5jci5vcmcvMCkGA1UdEQQiMCCCDGFsbGVuYXBwLmNvbYIQd3d3LmFsbGVuYXBwLmNvbTBMBgNVHSAERTBDMAgGBmeBDAECATA3BgsrBgEEAYLfEwEBATAoMCYGCCsGAQUFBwIBFhpodHRwOi8vY3BzLmxldHNlbmNyeXB0Lm9yZzCCAQUGCisGAQQB1nkCBAIEgfYEgfMA8QB2AEHIyrHfIkZKEMahOglCh15OMYsbA+vrS8do8JBilgb2AAABgw7Tu20AAAQDAEcwRQIgV7Pfs7ymD6BzDCe7UN0KnyQuwi9NG1pAoiDAVTbSdVUCIQCXF0SgNyIlTNuNmuIsEhLpobUiWSSuC+EIIEgf6PCfAwB3ACl5vvCeOTkh8FZzn2Old+W+V32cYAr4+U1dJlwlXceEAAABgw7Tu3EAAAQDAEgwRgIhAIwYPHF1w1xQJh8TUhyeKBq2ax+i+oTvKPBhjeo2tcc+AiEAy3zv040/BIMY1JEWeneXSAXzXz+bo1juzWj7wy7NYHIwDQYJKoZIhvcNAQELBQADggEBADdrrpSClQFRER+b8xuHWFV9RjqFdrz9cDIEUXFi5yltja9zHogKnF07cAM+1lfpGLCHevIiIowCbaYu28q6hafpW5yAAoxkZwlwSBFURj5UmIf/pci+Q0UssKFWPMtgUtQTZsZuYtnJe37AuEyDh5asZmpDQSkmZhddg6qtEmP1TN8hyf39yvhEQNGYmvLxn6zAiwzC6IdbKVeNpG+RzUKHX2toFGHsyFc6mdsumrxefswKV3ZWnj+SAI91x9hvCXO1ekdJ12U77ReMXkiHVyN6J4ly8glbzxc53Hz40s9zeEdC0ihpMC4VKY9Fl6yaLhvddcWnQi6Iq8BvipNjcg4=
-----END CERTIFICATE-----
`
    }
  },
  joi: {
    allowUnknown: true,
    abortEarly: false
  },
  database: {
    database: 'allenap_bus', //'sql5529114', //'sql5490974', //
    username: 'allenap_bus', //'sql5529114', //'allenap_bus', //'sql5490974', //
    password: 'x7bw4ROf9dUT', //'ArsvtyCUD3', //8pjHfFzZEY',
    host: 'localhost', //'sql5.freesqldatabase.com', //sql5.freemysqlhosting.net',
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
  },
  jwt: {
    TokenTtl: '1d',
    stayLoggedInTokenTtl: '30d',
    authKey: 'o12omucSlk7maWgbsAzSuG6eDlrPjpRb'
  },
  mailing: {
    host: 'smtp.gmail.com',
    port: 465, // 587
    secure: true, // true for 465, false for other ports
    from: 'Buses Trips',
    subjects: { activationMail: 'Activation Mail' },
    auth: {
      user: 'buses.trips@gmail.com', // generated ethereal user
      pass: 'buses@12345' // generated ethereal password
    }
  },
};
