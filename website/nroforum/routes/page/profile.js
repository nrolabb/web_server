const { isLogin, isAdmin } = require("../../middleware/auth.middleware")

module.exports = {
  name: "profile",
  method: "GET",
  middleware: [isLogin],
  run: async ({ req, res, user, options }) => {
    if ((await user.getInfo())[0]?.username) {
      var player = await user.getPlayer((await user.getInfo())[0]?.id)
      res.render("page/profile.ejs", {
        user: await user.getInfo(),
        player,
        options,
      });
    } else {
      res.redirect("/");
    }
  },
}
