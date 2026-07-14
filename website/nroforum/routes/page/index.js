module.exports = {
  name: "/",
  method: "GET",
  middleware: [],
  run: async({ req, res, user, options }) => {
    res.render("index.ejs", {
      user: await user.getInfo(),
      options,
    });
  },
};
