var jwt = require("jsonwebtoken");
var config = require("../config");
module.exports = {
  isLogin: (req, res, next) => {
    var token = req.cookies?.signature;
    try {
      jwt.verify(token, config.jwt_secretkey, (err, decoded) => {
        if (err) {
          return res.redirect("/login");
        }
        next();
      });
    } catch (e) {
      res.clearCookie("signature");
      res.redirect("/login");
    }
  },
  isFix: (req, res, next) => {
    try {
      return res.status(500).send("</>")      
    } catch(err){
      res.send(err)
    }
  },
  isAdmin: (req, res, next) => {
    try {
      var username = req.cookies?.username;
      global.sql.query("SELECT * FROM account WHERE username = ?", [username], (err, results) => {
        if (err) {
          console.error("Lỗi khi kiểm tra user:", err);
          resolve({
            error: true,
            message: "Lỗi khi kiểm tra user",
          });
        }
        if (results[0]?.is_admin === 1) {
          next();
        } else {
          res.send("<h1>Bạn không có quyền để truy cập vào đây!</h1><br><h2>Vui lòng trở về trang chủ</h2>");
        }
      });
    } catch (err) {
      res.redirect("/login");
    }
  },
};
