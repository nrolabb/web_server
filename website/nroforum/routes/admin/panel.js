var { isAdmin } = require("../../middleware/auth.middleware.js");
module.exports = {
  name: "panel/admin",
  method: "get",
  middleware: [isAdmin],
  run: async ({ req, res, user, options, sql }) => {
    const queryDatabase = (query) => {
      return new Promise((resolve, reject) => {
        sql.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    };

    var { type = "home" } = req.query;
    switch (type) {
      case "home": {
        try {
          const [totalUsersResult, allUserResult] = await Promise.all([queryDatabase("SELECT COUNT(*) AS totalUsers FROM account"), queryDatabase("SELECT * FROM account")]);

          return res.render("admin/home.ejs", {
            user: await user.getInfo(),
            options,
            totalUsers: totalUsersResult[0].totalUsers,
            allUser: allUserResult,
          });
        } catch (err) {
          console.error("Error querying the database:", err);
          return res.render("admin/home.ejs", {
            user: await user.getInfo(),
            options,
            totalUsers: "0",
            allUser: [],
          });
        }
      }
      case "addCoins": {
        try {
          const [totalUsersResult, allUserResult] = await Promise.all([queryDatabase("SELECT COUNT(*) AS totalUsers FROM account"), queryDatabase("SELECT * FROM account")]);
          res.render("admin/addCoins.ejs", {
            user: await user.getInfo(),
            options,
            totalUsers: totalUsersResult[0].totalUsers,
            allUsers: allUserResult,
          });
        } catch (err) {
          console.log(err)
        }
      }
      break;
      default: {
        res.redirect("/panel/admin?type=home");
      }
    }
  },
};
