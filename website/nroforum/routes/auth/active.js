var { isLogin, isAdmin } = require("../../middleware/auth.middleware")
var { active_coins } = require("../../config")
module.exports = {
    name: "active",
    middleware: [isLogin],
    method: "get",
    run: async ({ req, res, user }) => {
        var user = await user.getInfo();
        console.log({ type: 'active', username: user[0].username })
        sql.query("SELECT * FROM account WHERE username = ?", [user[0].username], (err, result) => {
            if (!result.length) {
                return res.redirect("/login")
            }
            let currentCoins = result[0].vnd;
            currentCoins = parseInt(currentCoins)
            if (result[0].active == 1) {
                return res.json({
                    error: false,
                    message: `Bạn đã kích hoạt rồi`
                })
            }
            if (currentCoins < active_coins) {
                return res.json({
                    error: true,
                    message: `Bạn còn thiếu ${active_coins - currentCoins} coins để kích hoạt!`
                })
            }
            var balanceDecrease = currentCoins - active_coins;
            sql.query("UPDATE account SET active = ?, vnd = ? WHERE username = ?", [1, balanceDecrease, user[0].username], (err, resp) => {
                if (err) {
                    console.log(err)
                    return res.json({
                        error: true,
                        message: `Không thể kích hoạt tài khoản này!`
                    })
                }
                return res.json({
                    error: false,
                    message: `Kích hoạt thành công !`
                })
            })
        })
    },
};
