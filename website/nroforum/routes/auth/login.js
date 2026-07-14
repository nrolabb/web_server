var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var config = require("../../config.js");
module.exports = {
  name: "auth/login",
  method: "POST",
  middleware: [],
  run: ({ req, res, sql }) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        error: true,
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    sql.query("SELECT * FROM account WHERE username = ?", [username], async (err, results) => {
      if (err) {
        console.error("Lỗi khi kiểm tra user:", err);
        return res.json({
          error: true,
          message: "Lỗi khi kiểm tra user",
        });
      }

      if (results.length === 0) {
        return res.json({
          error: true,
          message: "Tên người dùng không tồn tại",
        });
      }

      const storedHash = results[0].password;
      // const inputHash = crypto.createHash("md5").update(password).digest("hex");

      if (storedHash !== password) {
        return res.json({
          error: true,
          message: "Mật khẩu không chính xác",
        });
      }
      sql.query("SELECT * FROM player WHERE account_id = ?", [results[0].id], async (err, player_results) => {
        if(!player_results.length){
          return res.json({
            error: true,
            message: "Vui lòng vào game và tạo nhân vật !",
          });
        }
        var signature = jwt.sign(
          {
            username,
          },
          config.jwt_secretkey,
          { expiresIn: "7d" }
        );
        const thirtyDaysInSeconds = 7 * 24 * 60 * 60;
        const expires = new Date(Date.now() + thirtyDaysInSeconds * 1000);
        res.cookie("signature", signature, { expires, httpOnly: true });
        res.cookie("username", username, { expires, httpOnly: true });
        return res.json({
          error: false,
          message: "Đăng nhập thành công",
          data: signature,
        });
      })
    });
  },
};
