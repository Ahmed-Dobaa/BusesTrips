const fs = require('fs')

module.exports = {
  frontEnd: { host: 'http://localhost/frontEnd' },
  connection: {
    host: 'allenapp.com',  //'localhost',
    port: process.env.PORT || 2051,


  tls: {
    key: `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAusxQlVgjuGHJctYjk1NZgjJpyrvU2LkIZ6DlAKsnrN5JPpa25l
7/Ynt0dl6J4gWP6WMSlxqFkd8oycrVBlrFTICPG8GTqLO798IHFxZUmjDxxLNB78RR
Jcjh3HKL+cFn85d3MZkRMPergfdI7Nzme8ivpLsGbaofixCP6VKOlVdLJq/WDucbhR
pG1t6mzd5Y5KLCvkBTip1vCloQhfUtEvdt0qXa7+LDiJrUUwdFoMlHLuId+OVmVkyl
qLtDBjU7rJOTUAMdWnjMfppWtjfZE0qoUSbk44a4ZGeCOlhwLjvUq3y4H8YocFL6n3
eAhadqxQ20D3XNI2Cjpent47ohTQIDAQABAoIBABVc3m5l+RfSHx7B/KmRo6/vIggs
eQgcCSkIzofICy6K8Wd2Bw7LmHtj0QrkfvJZXn77dJnRT6tCEUEasEgcw2mfXj53Yf
KuM3X/O55ZUG2d4Vh0g7rvAbTHh4UVmIqEouXJ0bjbX4rxGC0x4aYtETLg3a2CMhcC
mL7nsv2lEmdjtUt1CVRZDd2Z++6crocBh4lKrzHwt61BCdaHyAMAZ1DTDstwMpQ2FH
RMSVIMI7rywRtOCQSh/PAwbvAlNeaQiEbIOtCFW/7zX5V1EEYxprC4UJbKx+fF/x3V
fJ19laAXyrSUWUpIZE9kDb1oj/Bfzn1PZZ4PcBzPgan7luPlyEUCgYEA4SAP8ww6S5
lqcPBF9JkcELJAYuE9SUTTY45IB3iaqr7GrAjXwZzcBqt54nBAlReksZTXinS4AkNi
HJRrAaMA6CDOkk2Xwm7aSQ9MH5ba7ndD9Te7yKQBlcVySXQtRtHEQBiQ1Z6+6uVJWN
5CPH6Tysd4uXs+5weEfQ4mCZK1M/MCgYEA1GqfUDqB1iYZU1X1ZBoMAauqQaXjDIcj
vFNV0RPlt/I3zl/9XtFqYe1lVqKMBFoPKqgtVgvylripvKthgK+7wr9ctHlhDnfre6
cprW4yopiCBtiuEQ9lv+Gk58puaTXBBdtmGYrGDODKioNF0c/SHkL9tDOnO32X9X5p
p+Cw5b8CgYBqGzuJOaUsRqXlj0nZjGSu9eTk9fZ11yuvC7ulUdHMUli/cveGONF3j1
DGSlQWMWudi2K/zl2AK5RNliKNRe/CeNwEFvBFYwwdTUl6xhZwOORd6qPmYG6i0coZ
FtnUPEA8WZfCJ60id2lHqpIbgylTdQrQmWc/asqmSonhDzW6wwKBgQCX2h1IGntlH1
lthP7nb+NzckhFpBSbiSSX5i9sR0Aq7yLMCz0zgpv9o9uVQqC8H7HF+fJnGCV1cFAP
i6kpePfOckUQ09D5qesTO96EmEnkiQgzYsWVdp9zvBjKh6HE3uO9jyn/SoDpBe5ldR
D9vAbnEVcTcvWzhsaSfquDkxKDOwKBgDHGPzRpNiBJ4nWHAjoq4gW+L448Sal4asYX
+suFIvcGMAMcuraRUQ+bm3iTUeX93/lRHbd1AEhr9ulU+MK4oNkUW3honEOSVT89XB
YO9tp5jsxEKEulzWFwwtbeL5qy1CT/NsHB5b52FwE4I1foK3FIgjGV8lpriWt5xpB8
nC5L
-----END RSA PRIVATE KEY-----
`,
      cert: `
-----BEGIN CERTIFICATE-----
MIIFNjCCBB6gAwIBAgISBLs1y5togQw2VCs01PNw6b65MA0GCSqGSIb3DQEBCwUA
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMjA1MTEyMTU5NDBaFw0yMjA4MDkyMTU5MzlaMBsxGTAXBgNVBAMT
EHd3dy5hbGxlbmFwcC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQC6zFCVWCO4Ycly1iOTU1mCMmnKu9TYuQhnoOUAqyes3kk+lrbmXv9ie3R2Xoni
BY/pYxKXGoWR3yjJytUGWsVMgI8bwZOos7v3wgcXFlSaMPHEs0HvxFElyOHccov5
wWfzl3cxmREw96uB90js3OZ7yK+kuwZtqh+LEI/pUo6VV0smr9YO5xuFGkbW3qbN
3ljkosK+QFOKnW8KWhCF9S0S923Spdrv4sOImtRTB0WgyUcu4h345WZWTKWou0MG
NTusk5NQAx1aeMx+mla2N9kTSqhRJuTjhrhkZ4I6WHAuO9SrfLgfxihwUvqfd4CF
p2rFDbQPdc0jYKOl6e3juiFNAgMBAAGjggJbMIICVzAOBgNVHQ8BAf8EBAMCBaAw
HQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYD
VR0OBBYEFFDtXRbCsUcDt0OQLgJZ89CadGFvMB8GA1UdIwQYMBaAFBQusxe3WFbL
rlAJQOYfr52LFMLGMFUGCCsGAQUFBwEBBEkwRzAhBggrBgEFBQcwAYYVaHR0cDov
L3IzLm8ubGVuY3Iub3JnMCIGCCsGAQUFBzAChhZodHRwOi8vcjMuaS5sZW5jci5v
cmcvMCkGA1UdEQQiMCCCDGFsbGVuYXBwLmNvbYIQd3d3LmFsbGVuYXBwLmNvbTBM
BgNVHSAERTBDMAgGBmeBDAECATA3BgsrBgEEAYLfEwEBATAoMCYGCCsGAQUFBwIB
FhpodHRwOi8vY3BzLmxldHNlbmNyeXB0Lm9yZzCCAQYGCisGAQQB1nkCBAIEgfcE
gfQA8gB3AN+lXqtogk8fbK3uuF9OPlrqzaISpGpejjsSwCBEXCpzAAABgLVZd+EA
AAQDAEgwRgIhAKNa0L/NZrsfak+WkDLWwhCrSn8BQIt1Hq6qWaNAEZWXAiEA6cp0
ZwEs1m7S1exbV4OdRVvC3/3glDpCaw3D2+dkHSQAdwApeb7wnjk5IfBWc59jpXfl
vld9nGAK+PlNXSZcJV3HhAAAAYC1WXfQAAAEAwBIMEYCIQDE8fb7jxQFAEaZ9tpB
kN+oav8030cGEZ+FnW50vz1S8gIhAJdVjLknTeZVa529Vy9NaI7Tt7WSZoNk9FGo
EKT8plJnMA0GCSqGSIb3DQEBCwUAA4IBAQCh013OReknZuT2z+4/TJSsChSHs2ou
8vxgtuGPPZ7tad393VrWi04UpPep4XhkzXRzCK7ShSq/E6tXuUzC0WYhk194y3fJ
Xa1m2rn9artmbTAwQpKBj7K5fslFYCdzPvjym1z9Kj1B73UKgFKNPvRlv/inugom
VXFRo/myYJiMHj98ACtvlk1k94kxm0Wco/KfmKhBOfg98KlTV3B0xz/Nagk8hoqg
2uGoBE9LvskkBgoFr5JgCJxs5sUC6JlzabC7R7XwjhzyRmzFg8BKVcQ6XfLzPImr
WfZNb6g2ntueaq/q+YskRdR5XlkDTvUFgkT0nRDEbN1TaLBJXxcpq8YZ
-----END CERTIFICATE-----
`
    }
  },
  joi: {
    allowUnknown: true,
    abortEarly: false
  },
  database: {
    database: 'allenap_bus', //'sql5490974',
    username: 'allenap_bus', //'sql5490974',
    password: 'x7bw4ROf9dUT', //8pjHfFzZEY',
    host: 'localhost', //sql5.freemysqlhosting.net',
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
