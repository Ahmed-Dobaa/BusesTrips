const fs = require("fs");

module.exports = {
  frontEnd: { host: "http://localhost/frontEnd" },
  connection: {
    host: "allenapp.com", // 'localhost', //,
    port: process.env.PORT || 2051,

    tls: {
      key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDLsdJsOESE2uv0
GZW+S5z/ILmV4aA9GGXlrFA2taZoNs2YFGZJOb48xpQM8Z/ycXGMgVJ6OfRRI52A
f3v/wbRZO8UQ4ISTSXSMtUx+GDtHAP9YquFJ8Y74tuI1+XeA+5xkcu7Fq7bgLbUm
O1S0b7l+QDqEqT9MeTUpU5snrihxbSe/ZUyiA6g3yVUpxh+yFQH8qc9fvI2U56G8
Tnnc73PqMM5OkfvoOcduCJ8swo226cqY+yFtc6fNVd4Rj51knNPqjM1d7Y3EaaCn
4aY6yuNA0wvMPj+9j9j4GNRib0jAFbMMk6A1P+qdx4JdA9OoJcbPbjh3XxXIDM0S
pBMW/Es3AgMBAAECggEAejjs5fqtQnqJ8iIX8+MzBPMB6KlFmOM24SUPzIQaoZWg
r4wuA+od+CG/XDTvoG3pkEFY1/ZGXxlbvGrCYKg+KvzuNj5Bzo7Y3EU87LxldSlo
DjAall/XRe2WtoRF7KMNKEi+dOWgCcvjUllvbgVL7DFl64wSazSfbXi5NIoPwl6F
WFAc3Ev/aby/AJB0KvB47Pk6ivtIGOA5nKech3BzziOOtIHyplDjUs7qzP5B73hF
FcGopNCah93/p9vBLV25cpr2zka7GBlyF+03mlr9tPgojNHhhSzA9kOJI7CQPiJf
1AWfjbAMvCxzhHtVv/PbyRQLCPFGTCbHDUjrlDbGwQKBgQD9qoJ0QqqRFACXhVt0
CXY5QEPhr2FGhMaUyBuN8HNOatKkJhSZgFKcBKfhgmZWo3nNWW+qWsQKCUu4owH6
wPZC47HEkfbcZt+erEcAtV9DAkTHxFEpxSS64IiH0TDvfIFbPytTKx5/HYkqxK6u
wUbsYzdfUcJj46d981wJ2hgTDwKBgQDNkZvM3C21omp/NzVImy3tZBUNF4P1S8+U
v0cK+D+pCP5o6hFFf+o7TE1186FOctwn94AEla99hmzkryLxPziiDgo8X8HSkvhF
8EFOXik/2CDB4FRRymQL+Xvwi/jtIMXbwgS5+D5cWBuoptgpzVCSanHUCWH0E6bH
bUwyZlulWQKBgF7w/6yl+xMbynDrv+P5Wp9o9z80FhN/xJeRIgcJFQ8nmjlH63Pc
fI7aiz8zQDxzKTZ7n/jByhf7jLTJhgclS8aTVEi/XQb3FgFcd6LDP6lj4vxl9P7O
Q8YSHee/mzI3hm7xgLS7Mcnf8yPnw32y52m4ZNQvVLNwVJMmj688SsBvAoGAELS6
oqVqGY6/dOM5s1LZIqe1hkDY+oBUuFPrJBsUoVoXwtLy4GEK2hLTYLiR7VwsRBs7
DiRUBLF9+/+3qT9oDNNzRYDKsaA8CQMDa6j/VS7tSpQ+hf8arlZyGhRmAG9fZQKZ
e7uO5dZLOSOGAa+r0ppP8dlpWnqWXTKmtJnY7NECgYBboqqB/AK8NmvovuMWYzgK
EWfl2fgjqHLcbvJbVSWJpu8xWCKydwZOtfnfdB5DZgppu6xfElO3vxyxZMf20UQI
ekUyXigJKpG9qGQKss6er1Y96YL+aW7VFVjfQxISG8xXOTgsROQRvyCggb2TJy+Y
0Fzib/v+csGATystdr6ZGg==
-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----
MIIGRjCCBS6gAwIBAgIRAIqn9noO43mYjuRCmAS6IEIwDQYJKoZIhvcNAQELBQAw
gY8xCzAJBgNVBAYTAkdCMRswGQYDVQQIExJHcmVhdGVyIE1hbmNoZXN0ZXIxEDAO
BgNVBAcTB1NhbGZvcmQxGDAWBgNVBAoTD1NlY3RpZ28gTGltaXRlZDE3MDUGA1UE
AxMuU2VjdGlnbyBSU0EgRG9tYWluIFZhbGlkYXRpb24gU2VjdXJlIFNlcnZlciBD
QTAeFw0yMjEyMjgwMDAwMDBaFw0yMzEyMjgyMzU5NTlaMB0xGzAZBgNVBAMTEmFk
bWluLmFsbGVuYXBwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AMux0mw4RITa6/QZlb5LnP8guZXhoD0YZeWsUDa1pmg2zZgUZkk5vjzGlAzxn/Jx
cYyBUno59FEjnYB/e//BtFk7xRDghJNJdIy1TH4YO0cA/1iq4Unxjvi24jX5d4D7
nGRy7sWrtuAttSY7VLRvuX5AOoSpP0x5NSlTmyeuKHFtJ79lTKIDqDfJVSnGH7IV
Afypz1+8jZTnobxOedzvc+owzk6R++g5x24InyzCjbbpypj7IW1zp81V3hGPnWSc
0+qMzV3tjcRpoKfhpjrK40DTC8w+P72P2PgY1GJvSMAVswyToDU/6p3Hgl0D06gl
xs9uOHdfFcgMzRKkExb8SzcCAwEAAaOCAwwwggMIMB8GA1UdIwQYMBaAFI2MXsRU
rYrhd+mb+ZsF4bgBjWHhMB0GA1UdDgQWBBTmJcX7HBLcnU2E9ogE1H1l/Qft4jAO
BgNVHQ8BAf8EBAMCBaAwDAYDVR0TAQH/BAIwADAdBgNVHSUEFjAUBggrBgEFBQcD
AQYIKwYBBQUHAwIwSQYDVR0gBEIwQDA0BgsrBgEEAbIxAQICBzAlMCMGCCsGAQUF
BwIBFhdodHRwczovL3NlY3RpZ28uY29tL0NQUzAIBgZngQwBAgEwgYQGCCsGAQUF
BwEBBHgwdjBPBggrBgEFBQcwAoZDaHR0cDovL2NydC5zZWN0aWdvLmNvbS9TZWN0
aWdvUlNBRG9tYWluVmFsaWRhdGlvblNlY3VyZVNlcnZlckNBLmNydDAjBggrBgEF
BQcwAYYXaHR0cDovL29jc3Auc2VjdGlnby5jb20wNQYDVR0RBC4wLIISYWRtaW4u
YWxsZW5hcHAuY29tghZ3d3cuYWRtaW4uYWxsZW5hcHAuY29tMIIBfgYKKwYBBAHW
eQIEAgSCAW4EggFqAWgAdgCt9776fP8QyIudPZwePhhqtGcpXc+xDCTKhYY069yC
igAAAYVYwVv7AAAEAwBHMEUCIHMynG7rlqJdJdDL2vQCX1ZotdyMQQfOZvABUkiW
FQ2uAiEA8XhryUChztzz+GTbt7Ls4FDL3fZ25XnIpIG9vKUv6NcAdgB6MoxU2Lct
tiDqOOBSHumEFnAyE4VNO9IrwTpXo1LrUgAAAYVYwVvNAAAEAwBHMEUCIQD29qrI
2ue1DTNpfF8Ur9CGMbRJdrB7sLcLn1t+Oqj5cAIgMKkk+NR0gRv3pJ0cBw7Drcn5
00Y/d3U16fMRxuDwXxAAdgDoPtDaPvUGNTLnVyi8iWvJA9PL0RFr7Otp4Xd9bQa9
bgAAAYVYwVunAAAEAwBHMEUCICH+cfXWklLM2z/Wvk36uDOQ3RwqLWzma/hcXOWr
pJ37AiEAt1uUymkrOLivugfXMwrUOCODCb+j1RIu/IkQxZWYJu8wDQYJKoZIhvcN
AQELBQADggEBAK+cU+lIHUKXapJHJ362/2y4JsJaLY0GXjpIhFiR9ui5xq3IUVis
uyBb4twGn6EB1Z4rbBp2z7v0j8h+7kN/oDoYUpWJN89wTocSSP8m1KKUSwSxSYR2
4SYjeEFbyJO7eGFU9igEPjVFdNFImg1TFqyAYRq71IS+iqXDAgFzoGswtKYcph+z
PA2AXssZyTpa0AhgbZoz+/NpO6/K94cjtjht3mBnd1RvNBD+FkH9oD5FBnn8qr4G
5fe2BWPfFTQmwippWr0LdtDHgkXLA151YitBRGizfN/9+V7PssLN2itWFpWWHQpV
S2wTZZMbSyZNTDnrcbLZb9bg6836mrWsIN8=
-----END CERTIFICATE-----
      `,
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
