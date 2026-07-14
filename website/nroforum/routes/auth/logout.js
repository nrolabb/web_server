module.exports = {
  name: "logout",
  middleware: [],
  method: "get",
  run: ({ req, res }) => {
    res.clearCookie("signature");
    res.clearCookie("username");
    res.redirect("/");
  },
};
