module.exports = {
  name: "history",
  method: "get",
  middleware: [],
  run: async ({ req, res, user, options }) => {
    if ((await user.getInfo())[0]?.username) {
      var player = await user.getPlayer((await user.getInfo())[0]?.id)
      var history = await user.getHistory((await user.getInfo())[0]?.id)
      res.render("page/history.ejs", {
        user: await user.getInfo(),
        options,
        player,
        history
      });
    }
    else {
      return res.redirect("/login")
    }
  },
};
