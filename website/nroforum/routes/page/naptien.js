const { isLogin, isAdmin } = require("../../middleware/auth.middleware")
var { QRPay, BanksObject } = require("vietnam-qr-pay");
var config = require("../../helper/config.json")
module.exports = {
  name: "naptien",
  method: "get",
  middleware: [isLogin],
  run: async ({ req, res, user, options, next }) => {
    try {
      const qrPay = QRPay.initVietQR({
        bankBin: BanksObject.mbbank.bin,
        bankNumber: config.stkCheck, // Số tài khoản
        purpose: 'dragonsuper ' + (await user.getInfo())[0]?.username, // Nội dung chuyển tiền
      })
      const content = qrPay.build()
      res.render("page/naptien.ejs", {
        user: await user.getInfo(),
        qrcontent: content,
        dataCK: [
          {
            "telco": "ZING",
            "value": 10000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 10000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 10000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 10000,
            "fees": 23,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 10000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 10000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 10000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 10000,
            "fees": 15.7,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 20000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 20000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 20000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 20000,
            "fees": 23,
            "penalty": 50
          },
          {
            "telco": "GARENA2",
            "value": 20000,
            "fees": 15.9,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 20000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 20000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 20000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 20000,
            "fees": 15.7,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 30000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 30000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 30000,
            "fees": 15.7,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 30000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 50000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 50000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "GARENA2",
            "value": 50000,
            "fees": 15.9,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 50000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 50000,
            "fees": 13.9,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 50000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 50000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 50000,
            "fees": 20,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 50000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 100000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 100000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 100000,
            "fees": 13.9,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 100000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 100000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 100000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 100000,
            "fees": 20,
            "penalty": 50
          },
          {
            "telco": "GARENA2",
            "value": 100000,
            "fees": 14.9,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 100000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 200000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 200000,
            "fees": 20,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 200000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 200000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 200000,
            "fees": 15.7,
            "penalty": 50
          },
          {
            "telco": "GARENA2",
            "value": 200000,
            "fees": 14.9,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 200000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 200000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 200000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 300000,
            "fees": 11.5,
            "penalty": 5
          },
          {
            "telco": "VINAPHONE",
            "value": 300000,
            "fees": 10.9,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 300000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 300000,
            "fees": 15.7,
            "penalty": 0
          },
          {
            "telco": "MOBIFONE",
            "value": 300000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 500000,
            "fees": 15.5,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 500000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VINAPHONE",
            "value": 500000,
            "fees": 13.9,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 500000,
            "fees": 19,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 500000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "GARENA2",
            "value": 500000,
            "fees": 14.9,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 500000,
            "fees": 16.7,
            "penalty": 50
          },
          {
            "telco": "MOBIFONE",
            "value": 500000,
            "fees": 18.9,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 500000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 1000000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "GATE",
            "value": 1000000,
            "fees": 19,
            "penalty": 50
          },
          {
            "telco": "ZING",
            "value": 1000000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VIETTEL",
            "value": 1000000,
            "fees": 16.7,
            "penalty": 50
          },
          {
            "telco": "VNMB",
            "value": 1000000,
            "fees": 13.5,
            "penalty": 50
          },
          {
            "telco": "ZING2",
            "value": 1000000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 2000000,
            "fees": 11.5,
            "penalty": 50
          },
          {
            "telco": "VCOIN",
            "value": 5000000,
            "fees": 11.5,
            "penalty": 50
          }
        ],
        options
      });
    } catch (err) {
      next(err)
    }
  },
};
