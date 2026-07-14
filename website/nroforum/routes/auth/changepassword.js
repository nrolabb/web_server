var { isLogin } = require("../../middleware/auth.middleware")
var crypto = require("crypto");
module.exports = {
    name: "auth/changePassword1111",
    middleware: [isLogin],
    method: "post",
    run: async ({ req, res, next, user }) => {
        try {
            var user = await user.getInfo();
            var { oldPassword, newPassword } = req.body;
            console.log(req.body)
            const passwordPattern = /^[a-z0-9]+$/i;

            if (!passwordPattern.test(newPassword)) {
                return res.json({
                    error: true,
                    message: "Mật khẩu không được chứa ký tự đặc biệt, chữ in hoa, khoảng trắng!",
                });
            }
            if (!oldPassword || !newPassword) {
                return res.json({
                    error: true,
                    message: "Vui lòng nhập đầy đủ thông tin !"
                })
            }
            if (oldPassword != user[0].password) {
                return res.json({
                    error: true,
                    message: "Mật khẩu cũ không đúng !"
                })
            }
            global.sql.query("UPDATE account SET password = ? WHERE username = ?", [newPassword, user[0].username], (err, results) => {
                if (err) {
                    return res.json({
                        error: true,
                        message: "Đã xảy ra lỗi tại hệ thống!"
                    })
                }
                res.clearCookie("signature");
                res.clearCookie("username");
                return res.json({
                    error: false,
                    message: "Đổi mật khẩu thành công!"
                })
            })
        } catch (err) {
            next(err)
        }
    },
};
