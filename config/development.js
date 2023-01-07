const fs = require("fs");

module.exports = {
  frontEnd: { host: "http://localhost/frontEnd" },
  connection: {
    host: "allenapp.com", // 'localhost', //,
    port: process.env.PORT || 2051,

    tls: {
      key: `-----BEGIN PRIVATE KEY-----
      MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdVHqXspmk1XFM
      mQJSoOoMDbP6OqJwVbgjlJlkUmaaJDhOFaZkBEOwC6Zw0mTzts5Aluc1ye5odHmr
      977QeVlInLvu9b9/cLQP+sXu2r++RRDzFfTqXfbol5aEE5eRDltbCTt1/NPlbmYs
      cAjeZ8KzaeOobzLk90tRzOgRZbtcOnuuQx047OA5ZRrNqS2h8YSG5hml8rfRzZ09
      MSKp0fuVNX6zQPIUo/ru1BKvIir4f2rNOowXL9XAvCyrlq8vHtARCQ3ESvt3I3aN
      uoNZUsYztJGOveE+0W993Zt4+dMqV/PDNuN3XVTbMOj/NMrS2InabNQWl18RRERj
      hMccZswhAgMBAAECggEBAIomb/r+PQ75N6YzH5MJ4+0wJHX9YWUy7CQxXemT0X1H
      PGno85ocW0+ohfSILwE8ytLgHmOhrpE+mq+vjUg9ZnB/fIL0m9plM8+BnUiw+9w8
      6g6BVwVvL24RKJ86R3IAfx98zMOh03WzCk2UhMSmCY7JepOpDSCEB1yAxR4O3Pr8
      UQfrzjre7O1xNDwl5ohxJcFWs5A94y7xqWilTOI+of0nqhhM3Y3QUac2Wy6E6pEt
      cSpze26YCfj4RWcQaNtdzhyUbUquiCFjiCDo8hrdvgJwHWerF4U5EJFlYQWFn1pj
      63YDnz+yP+CDIutbkX5+Ie78Y9eJV/9yS/uVxslrye0CgYEA8KdO7f8bPFS+/Vj4
      GkGF/MOkUyBZ1mKYMsLj+NGOiLNU4VJtqvdMpoqAgLu1zMqXDjWRiLSHHY+oCksJ
      GNzTiHyTen2h5O1sYlmzUVuVIW/IBJp2PWSQSDyKRsFQOX7Y1gXapqXEOuNFuEEA
      J/hlMjPvfAT5PPLpjSyD6McssX8CgYEA63G2NaeqlBOfEG/Q2AKbXbFX6TX6letD
      jpj5Y6W9FgBAB8jt01eBMx1Az+glRn3pP4loDg4SWKyf3nfsB1TjFEx03Nh03Yop
      XgiT4iuZ4R4G/5D99L4lTl2LKb5izAQnP0Vfjxkkzbo+vVP73q/FzXu7doVsMlJ1
      GngSAdCqEl8CgYB18Ci4bot0d7vaAV4lz/LQOzkvG+2rKUqZpfV/nYOS7wAsJO9m
      GChSfhIYBOZF5Qs+hXY7Xu3QyPR7huaAbsikXRkRsLxEqy6wzHEa8B0X8+Y8i05j
      LAOhwzmpD1g3tTijOt87SIXwri0e7YwcCpndjqJRT0auXgWjkCtdSy9WFQKBgQCJ
      lVxtxDm46DJmb4DyCavyt0RxAlsZqm5C8P+jDGIPbjv8kJzxiEv2q5yJIdZOeBuK
      Rmho9i4gZVfSr+9cZW2BGiCcQV0hbLA5w/dvDh2Q4HQkefz9PPQd9CnzTc77+11X
      6tkpjP7lvXUWO/KOMdb7+dcVLmiIi4jk289iAiawLwKBgGC42qlNZRCKJ2ikHRY9
      ULvaPFxxBFrqwmCHINUDC638EIkqApx+nf+48U52jctcSSmkn4LpOCpxLr/f5Pj0
      Dk7EsNDKyBsBn/5CLB/MruQIGXGDjaO7FuyMx7Ph3Pd6AEsiaDGV2YK0f61cQQb7
      Pz7vm2xKVRWk1lvxOmSrVxq9
      -----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----
      MIIGRTCCBS2gAwIBAgIQZNZBqb27+u0xQw76BTrikDANBgkqhkiG9w0BAQsFADCB
      jzELMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4G
      A1UEBxMHU2FsZm9yZDEYMBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTcwNQYDVQQD
      Ey5TZWN0aWdvIFJTQSBEb21haW4gVmFsaWRhdGlvbiBTZWN1cmUgU2VydmVyIENB
      MB4XDTIyMTIzMTAwMDAwMFoXDTIzMTIyODIzNTk1OVowHTEbMBkGA1UEAxMSYWRt
      aW4uYWxsZW5hcHAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
      3VR6l7KZpNVxTJkCUqDqDA2z+jqicFW4I5SZZFJmmiQ4ThWmZARDsAumcNJk87bO
      QJbnNcnuaHR5q/e+0HlZSJy77vW/f3C0D/rF7tq/vkUQ8xX06l326JeWhBOXkQ5b
      Wwk7dfzT5W5mLHAI3mfCs2njqG8y5PdLUczoEWW7XDp7rkMdOOzgOWUazaktofGE
      huYZpfK30c2dPTEiqdH7lTV+s0DyFKP67tQSryIq+H9qzTqMFy/VwLwsq5avLx7Q
      EQkNxEr7dyN2jbqDWVLGM7SRjr3hPtFvfd2bePnTKlfzwzbjd11U2zDo/zTK0tiJ
      2mzUFpdfEUREY4THHGbMIQIDAQABo4IDDDCCAwgwHwYDVR0jBBgwFoAUjYxexFSt
      iuF36Zv5mwXhuAGNYeEwHQYDVR0OBBYEFPrqsjRVUHNmbN6Mmp0+do9dmBb/MA4G
      A1UdDwEB/wQEAwIFoDAMBgNVHRMBAf8EAjAAMB0GA1UdJQQWMBQGCCsGAQUFBwMB
      BggrBgEFBQcDAjBJBgNVHSAEQjBAMDQGCysGAQQBsjEBAgIHMCUwIwYIKwYBBQUH
      AgEWF2h0dHBzOi8vc2VjdGlnby5jb20vQ1BTMAgGBmeBDAECATCBhAYIKwYBBQUH
      AQEEeDB2ME8GCCsGAQUFBzAChkNodHRwOi8vY3J0LnNlY3RpZ28uY29tL1NlY3Rp
      Z29SU0FEb21haW5WYWxpZGF0aW9uU2VjdXJlU2VydmVyQ0EuY3J0MCMGCCsGAQUF
      BzABhhdodHRwOi8vb2NzcC5zZWN0aWdvLmNvbTA1BgNVHREELjAsghJhZG1pbi5h
      bGxlbmFwcC5jb22CFnd3dy5hZG1pbi5hbGxlbmFwcC5jb20wggF+BgorBgEEAdZ5
      AgQCBIIBbgSCAWoBaAB2AK33vvp8/xDIi509nB4+GGq0Zyldz7EMJMqFhjTr3IKK
      AAABhWgqUS8AAAQDAEcwRQIhAJy9j+krJGKKfotlLM5ughgh17m0X06AHWUFuy5/
      blCJAiAlMdmxpWZ1/XYZEN5zuNxfTHYH40hzVJlHItDVie/IhwB3AHoyjFTYty22
      IOo44FIe6YQWcDIThU070ivBOlejUutSAAABhWgqUPUAAAQDAEgwRgIhAOLspDJc
      oaH+FAMMIeE78lCE09O+95wb5FjSfWrhTdScAiEA7KYm1zRHsPQ8V0IKttyJ04LW
      taG4FDnFLkzLrCKY2GwAdQDoPtDaPvUGNTLnVyi8iWvJA9PL0RFr7Otp4Xd9bQa9
      bgAAAYVoKlDXAAAEAwBGMEQCIEharPZLHLgzidL3zt1LfB1LOBKqT1eLGKFaACvK
      zAekAiAo8vCDfYnZvQjrFo3MKYAY/UTIboxIQvFnzXlIyXK6bTANBgkqhkiG9w0B
      AQsFAAOCAQEAB0IIDY+1XeLtgTUHKXqSF5oDVDhbnd6b5a2GdVJUmCEpFWQYUJtZ
      Jmpzlto+J4ZH9y6j10P042qXXj4nV7T+AVum0E3C1BTCQT9+g7qP5/mKyl9UnK2U
      XoDF+5RrfeCBo67yvQi1IIIlfz5SXmXbGKnYFp4Q+tcFtC+TAVEVGtTu++FXvjld
      loJKzjehiyXYZq1WxuMQr9+CkFU3D+p75ZtGccID1D1FCRoWTFg/q3dduamU/696
      GFZ9I1lG+UZy4X29q3AUMZfau9sPjI22qQtReLa8fmuUKFRJNYiqNHvosKJ4G39v
      Nfhbh+4vVEbzj671vlycl5iHR5wtzlaohw==
      -----END CERTIFICATE-----`,
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
