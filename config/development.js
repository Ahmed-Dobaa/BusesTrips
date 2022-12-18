const fs = require('fs')

module.exports = {
  frontEnd: { host: 'http://localhost/frontEnd' },
  connection: {
    host: 'allenapp.com',  // 'localhost', //,
    port: process.env.PORT || 2051,


tls: {
key: `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAtKZvYV0ofOITsQCu+mM0qSkGcB6aUCjFqv0HIe9oSgh8TxDJlSqA3p4H6HLInAajy2Vk0pGwL1ZLEF67WjBvzBJ+Ol6uxh5w9X6cae1WNhYbxmXw/UdM4/W2RNs4H3UjzFQ0Gd0NIdZCfkaKxi774Z1WdPKYYlJ2YffUpwZvaNRfzgToEDPmIrz3MVH6Ntc0AH9NBr7eoT1HRU5DeLOtAmrcs3oks5K8Vp+6Btaii1w2rm6fI1QT3sYZYTPlrVJ9+rlLZQDqDsWcW+gBwEdBEqPcAb+LhTIJvKofU//1xX7Sgm/h14L5abw8SXutKP9jN7qV2u5Si68oSQYsFxcywQIDAQABAoIBAC4VHuiJaSCiUz+d2wUIdZCJZJkJVXgJTpNVxJIFjmcETyGkOKgSlZk0WvQTA9W5Y+Mo1FVa0MTikHd2kvhozrwSI50kNhVYApy9VY03+/wEG8W6j4UswRKNxZc/DMwJh75B5KCMYSM2kvO/bvsrVRmylzFyCSlbu9M180tAOv9Ub/yA+MtxCyjwrRwRMxoMXahLJ97tyVWqDsONHMGaIZrNzYFObWKO+YqzUCuxNsmzQmUoJcXAqHCK+GMjvpgX4FL32A2LJZaDCvwM1j/I80meZuh/uI9Kn5cArYfP5tGF1421d/02OXweBsinZowT6bzYBN6Y1qfAKB+hal8q8jkCgYEA12F6Ba7VWCY9ITunI8cSxaPGSdhAt6qcYclF6Mqg6h0x3e7ypZGAPDdK6gjVrdZRCxFLRYqK67lAIOMhBmCwqrdHHninz4cAQmCyaNXBi8qctOd7bUXb4luIyUgIPaQAa6fomrXRAqLVS/dcWKOAit+Uh7nCU48ahcpQOGj7UD8CgYEA1rgsWoS+lmicSUjXiIF6I0IJCOhF+w35fWypErLeMG3aU5V1arinN5sTmNnAmp+DWBNvzt0yahC094LB5u14kOpSnYsQA3Gebxiks+NGua7IJc1yf/Vbf/Rf1b+QtyjdS1P5ZMwnhnemfRDjClqko9cgXPszU7gHJWRw5BUsvP8CgYB/WD4KcCXqWamZJakcKU87FitebANP1Qtjcdro2i2sXpimbOqA5HeaouKjX5ffkbEXRyFnO5QJ7d0x1LkpCTBLr9PX+2TU+jA4Du5Nt90Y5zIicB91K3Hn81D8GZ/tujMZdAy+tLOgyGAu61Fpgzq0YZ9zZGy2dQ0sf8NQpxm4hwKBgQC3WUk2ekesc+OQiIzTWYyL8uV4H68yM7qpKVIuT2J/hC58VRGQceEIEHnpeXeIEVG8scw1nphgDagZ+iPNJ1ZemFi3gnnIFwss3qQ1n4tTHzZ1YTu2nDLnzirPgOb4IALnQeuh8NqHbkBSZ0sYGlKgPSC7hR1NDcW8Xkov2Qz8zQKBgHu34M0/lCmYpqrbqrQ1KQ5GL4xGMxhTWbHHVkotOFYlJQZru0WWLAijXDcqhvsAvIyyGlGH+m+3SqIjS9hrVfl02vhSZowc/L5Trx3ZvzZNmP5VQCB173o5SPDWANKj+jgyJ0P3GjPKZnsxFkNsUAgegWQmKcAdg6TP6G0Ey89B
-----END RSA PRIVATE KEY-----
`,
cert: `
-----BEGIN CERTIFICATE-----
MIIFRjCCBC6gAwIBAgISBGjc0NDl0P5VNJqKEg1DmcNSMA0GCSqGSIb3DQEBCwUAMDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQDEwJSMzAeFw0yMjEyMTgxMTA2MzZaFw0yMzAzMTgxMTA2MzVaMCExHzAdBgNVBAMTFnd3dy5hZG1pbi5hbGxlbmFwcC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0pm9hXSh84hOxAK76YzSpKQZwHppQKMWq/Qch72hKCHxPEMmVKoDengfocsicBqPLZWTSkbAvVksQXrtaMG/MEn46Xq7GHnD1fpxp7VY2FhvGZfD9R0zj9bZE2zgfdSPMVDQZ3Q0h1kJ+RorGLvvhnVZ08phiUnZh99SnBm9o1F/OBOgQM+YivPcxUfo21zQAf00Gvt6hPUdFTkN4s60CatyzeiSzkrxWn7oG1qKLXDaubp8jVBPexhlhM+WtUn36uUtlAOoOxZxb6AHAR0ESo9wBv4uFMgm8qh9T//XFftKCb+HXgvlpvDxJe60o/2M3upXa7lKLryhJBiwXFzLBAgMBAAGjggJlMIICYTAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFHGNdGsj8hk8vO75TWiBdQjOY6raMB8GA1UdIwQYMBaAFBQusxe3WFbLrlAJQOYfr52LFMLGMFUGCCsGAQUFBwEBBEkwRzAhBggrBgEFBQcwAYYVaHR0cDovL3IzLm8ubGVuY3Iub3JnMCIGCCsGAQUFBzAChhZodHRwOi8vcjMuaS5sZW5jci5vcmcvMDUGA1UdEQQuMCyCEmFkbWluLmFsbGVuYXBwLmNvbYIWd3d3LmFkbWluLmFsbGVuYXBwLmNvbTBMBgNVHSAERTBDMAgGBmeBDAECATA3BgsrBgEEAYLfEwEBATAoMCYGCCsGAQUFBwIBFhpodHRwOi8vY3BzLmxldHNlbmNyeXB0Lm9yZzCCAQQGCisGAQQB1nkCBAIEgfUEgfIA8AB2AHoyjFTYty22IOo44FIe6YQWcDIThU070ivBOlejUutSAAABhSUg/XIAAAQDAEcwRQIgS7w6YFyRKV/MpfCHbkzOSubOv1s5V5gcNG4JOcv61ucCIQDiDqJrzVFZeIPBtgKy1RvBc+1wfPhPDsdi3gVcXQV6bgB2ALc++yTfnE26dfI5xbpY9Gxd/ELPep81xJ4dCYEl7bSZAAABhSUg/04AAAQDAEcwRQIhAL6KnjCEINkzJz+dNjl8iqKEeMB55YRI8jQFJkCubovrAiBuUgjytxSzKdmiSw6DI56SGkQ3GNRKuEUQ1KtIWH/AODANBgkqhkiG9w0BAQsFAAOCAQEAnDa0LeJo3v6yKC9W0IUpibQ2j6jIeLb2VsCPKdxB1Fpl1g7L+dRQ2uSX4UrfTWbU2gzyBN8G2XfqZn9KamtrDVwn/yfrshmRABmlpscI22vhK7mwyEo+pAPv5jaoOPA15fbvBNfZKnAYMp7Mua1IqnOqtKepjQzPFvTi3JWwXRWW5xvCnrS5QDigpCCUUEhlRtsmcHpCoi4GdCGEAKFfgDjA880pYQsKGRUCBDVo+ZJJ1uUSqMZ7BY7YIEdGeblxhRnFdIKNFhkHV0lYAzXIThYT0p9ewJ0uNpcRjdnq/RqOCf9YfBhQ070hjiX5xZ8TLUDznErhPYNUwH7gR4QGdQ==
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
