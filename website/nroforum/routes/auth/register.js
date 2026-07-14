var crypto = require("crypto");
var axios = require("axios")
module.exports = {
  name: "auth/register",
  middleware: [],
  method: "post",
  run: async({ req, res, sql }) => {
    try {
      const { username, password, captcha } = req.body;

      if (!username || !password) {
        return res.json({
          error: true,
          message: "Vui lòng nhập đầy đủ thông tin!",
        });
      }
  
      const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernamePattern.test(username.toLowerCase())) {
        return res.json({
          error: true,
          message: "Vui lòng nhập username hợp lệ!",
        });
      }
  
      const passwordPattern = /^[a-z0-9]+$/i;
  
      if (!passwordPattern.test(password)) {
        return res.json({
          error: true,
          message: "Mật khẩu không được chứa ký tự đặc biệt, chữ in hoa, khoảng trắng!",
        });
      }
    //  const secret = "6Ld4ANEpAAAAACTKDw6eFX7vslgTShvTEEbftG6A";

    //  const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captcha}`);
    //  console.log(response.data);
    //  if (!response.data.success) {
    
    //      return res.json({
       //       status: false,
      //        message: 'Bạn không phải là con người!'
      //    });
   //   }
      sql.query("SELECT * FROM account WHERE username = ?", [username.toLowerCase()], (err, results) => {
        if (err) {
          console.error("Lỗi khi kiểm tra user:", err);
          return res.json({
            error: true,
            message: "Lỗi khi kiểm tra user",
          });
        }
  
        if (results.length > 0) {
          return res.json({
            error: true,
            message: "User đã tồn tại trong cơ sở dữ liệu",
          });
        }
  
        // const hash = crypto.createHash("md5").update(password).digest("hex");
        const insertUserQuery = `INSERT INTO account (username, password) VALUES (?, ?)`;
        sql.query(insertUserQuery, [username.toLowerCase(), password], (err, insertResult) => {
          if (err) {
            console.error("Lỗi khi thêm dữ liệu vào bảng user:", err);
            return res.json({
              error: true,
              message: "Lỗi khi thêm dữ liệu vào bảng user",
            });
          }
          console.log("Dữ liệu đã được thêm thành công vào bảng user");
          return res.json({
            error: false,
            message: "Đăng ký thành công",
          });
        });
      });
    } catch(err){
      console.log(err)
      return res.json({
        error: true,
        message: "Đã xảy ra lỗi tại server",
      });
    }
  },
};
