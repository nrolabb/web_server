const { isLogin, isAdmin } = require("../../middleware/auth.middleware")


module.exports = {
    name: "spin",
    method: "GET",
    middleware: [isLogin],
    run: async ({ req, res, user, options }) => {
        res.render("page/spin.ejs", {
            user: await user.getInfo(),
            options
        })
    },
}