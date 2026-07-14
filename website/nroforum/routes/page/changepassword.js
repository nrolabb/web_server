const { isLogin, isAdmin } = require("../../middleware/auth.middleware")


module.exports = {
    name: "changepassword",
    method: "GET",
    middleware: [isLogin],
    run: async ({ req, res, user, options }) => {
        res.render("page/changepass.ejs", {
            user: await user.getInfo(),
            options
        })
    },
}