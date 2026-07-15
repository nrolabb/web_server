var { isAdmin } = require("../../middleware/auth.middleware.js");
var config = require("../../config");
var fs = require("fs-extra");
var path = require("path");

module.exports = {
  name: "panel/admin",
  method: "get",
  middleware: [isAdmin],
  run: async ({ req, res, user, options, sql }) => {
    const queryDatabase = (query, params) => {
      return new Promise((resolve, reject) => {
        sql.query(query, params || [], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    };

    const readLogFile = (filename, maxLines) => {
      try {
        var logPath = path.join(config.logPath, filename);
        if (!fs.existsSync(logPath)) return [];
        var content = fs.readFileSync(logPath, "utf-8");
        var lines = content.split("\n").filter(function (l) {
          return l.trim() !== "";
        });
        return lines.slice(-maxLines);
      } catch (err) {
        console.error("Error reading log file:", err);
        return ["[Error] Cannot read log file: " + err.message];
      }
    };

    // Parse server config from Config.properties
    const parseServerConfig = () => {
      try {
        var configPath = "c:\\NROServer\\Config.properties";
        if (!fs.existsSync(configPath)) {
          configPath = "c:\\NROServer\\SERVER_NRO_ARN\\Config.properties";
        }
        var content = fs.readFileSync(configPath, "utf-8");
        var cfg = {};
        content.split("\n").forEach(function (line) {
          line = line.trim();
          if (!line || line.startsWith("#")) return;
          var eqIndex = line.indexOf("=");
          if (eqIndex === -1) return;
          var key = line.substring(0, eqIndex).trim();
          var val = line.substring(eqIndex + 1).trim();
          cfg[key] = val;
        });
        return {
          name: cfg["server.name"] || "NRO ARN",
          ip: cfg["server.ip"] || "127.0.0.1",
          port: cfg["server.port"] || "14445",
          maxPlayer: cfg["server.maxplayer"] || "300",
          expRate: cfg["server.expserver"] || "1",
          dbName: cfg["database.name"] || "nro_arn",
        };
      } catch (err) {
        return {
          name: "NRO ARN",
          ip: "127.0.0.1",
          port: "14445",
          maxPlayer: "300",
          expRate: "1",
          dbName: "nro_arn",
        };
      }
    };

    var adminUser = req.cookies?.username || "Admin";
    var { type = "home" } = req.query;

    // Render helper — renders tab content inside the admin-panel layout
    const renderPanel = (tabFile, data) => {
      var ejs = require("ejs");
      var tabPath = path.join(
        __dirname,
        "../../views/admin/tabs",
        tabFile
      );
      ejs.renderFile(tabPath, data, function (err, tabHtml) {
        if (err) {
          console.error("Error rendering tab:", err);
          return res.status(500).send("Error rendering tab: " + err.message);
        }
        res.render("admin/admin-panel.ejs", {
          activeTab: type,
          pageTitle: data.pageTitle || "Dashboard",
          adminUser: adminUser,
          contentPartial: tabHtml,
        });
      });
    };

    switch (type) {
      case "home": {
        try {
          const [totalUsersResult, allUserResult, totalPlayersResult] =
            await Promise.all([
              queryDatabase("SELECT COUNT(*) AS totalUsers FROM account"),
              queryDatabase("SELECT * FROM account"),
              queryDatabase("SELECT COUNT(*) AS totalPlayers FROM player"),
            ]);

          var totalRevenue = allUserResult.reduce(function (acc, curr) {
            return acc + (Number(curr.tongnap) || 0);
          }, 0);

          renderPanel("dashboard.ejs", {
            pageTitle: "Dashboard",
            totalUsers: totalUsersResult[0].totalUsers,
            totalPlayers: totalPlayersResult[0].totalPlayers,
            totalRevenue: totalRevenue,
            allUser: allUserResult,
            serverConfig: parseServerConfig(),
          });
        } catch (err) {
          console.error("Dashboard error:", err);
          renderPanel("dashboard.ejs", {
            pageTitle: "Dashboard",
            totalUsers: 0,
            totalPlayers: 0,
            totalRevenue: 0,
            allUser: [],
            serverConfig: parseServerConfig(),
          });
        }
        break;
      }

      case "logs": {
        var logLines = readLogFile("server.log", config.maxLogLines);
        renderPanel("logs.ejs", {
          pageTitle: "Server Log",
          logLines: logLines,
        });
        break;
      }

      case "accounts": {
        try {
          var page = parseInt(req.query.page) || 1;
          var perPage = 20;
          var offset = (page - 1) * perPage;
          var searchQuery = req.query.search || "";

          var countQuery = "SELECT COUNT(*) AS total FROM account";
          var dataQuery =
            "SELECT * FROM account ORDER BY id DESC LIMIT ? OFFSET ?";
          var countParams = [];
          var dataParams = [perPage, offset];

          if (searchQuery) {
            countQuery =
              "SELECT COUNT(*) AS total FROM account WHERE username LIKE ?";
            dataQuery =
              "SELECT * FROM account WHERE username LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?";
            countParams = ["%" + searchQuery + "%"];
            dataParams = ["%" + searchQuery + "%", perPage, offset];
          }

          const [countResult, accountsResult] = await Promise.all([
            queryDatabase(countQuery, countParams),
            queryDatabase(dataQuery, dataParams),
          ]);

          var totalAccounts = countResult[0].total;
          var totalPages = Math.ceil(totalAccounts / perPage);

          renderPanel("accounts.ejs", {
            pageTitle: "Quản lý Tài khoản",
            accounts: accountsResult,
            totalAccounts: totalAccounts,
            totalPages: totalPages,
            currentPage: page,
            searchQuery: searchQuery,
          });
        } catch (err) {
          console.error("Accounts error:", err);
          renderPanel("accounts.ejs", {
            pageTitle: "Quản lý Tài khoản",
            accounts: [],
            totalAccounts: 0,
            totalPages: 0,
            currentPage: 1,
            searchQuery: "",
          });
        }
        break;
      }

      case "players": {
        try {
          var page = parseInt(req.query.page) || 1;
          var perPage = 20;
          var offset = (page - 1) * perPage;
          var searchQuery = req.query.search || "";

          var countQuery = "SELECT COUNT(*) AS total FROM player";
          var dataQuery =
            "SELECT p.*, a.username AS account_username FROM player p LEFT JOIN account a ON p.account_id = a.id ORDER BY p.id DESC LIMIT ? OFFSET ?";
          var countParams = [];
          var dataParams = [perPage, offset];

          if (searchQuery) {
            countQuery =
              "SELECT COUNT(*) AS total FROM player p LEFT JOIN account a ON p.account_id = a.id WHERE p.name LIKE ? OR a.username LIKE ?";
            dataQuery =
              "SELECT p.*, a.username AS account_username FROM player p LEFT JOIN account a ON p.account_id = a.id WHERE p.name LIKE ? OR a.username LIKE ? ORDER BY p.id DESC LIMIT ? OFFSET ?";
            var searchParam = "%" + searchQuery + "%";
            countParams = [searchParam, searchParam];
            dataParams = [searchParam, searchParam, perPage, offset];
          }

          const [countResult, playersResult] = await Promise.all([
            queryDatabase(countQuery, countParams),
            queryDatabase(dataQuery, dataParams),
          ]);

          var totalPlayers = countResult[0].total;
          var totalPages = Math.ceil(totalPlayers / perPage);

          renderPanel("players.ejs", {
            pageTitle: "Quản lý Player",
            players: playersResult,
            totalPlayers: totalPlayers,
            totalPages: totalPages,
            currentPage: page,
            searchQuery: searchQuery,
          });
        } catch (err) {
          console.error("Players error:", err);
          renderPanel("players.ejs", {
            pageTitle: "Quản lý Player",
            players: [],
            totalPlayers: 0,
            totalPages: 0,
            currentPage: 1,
            searchQuery: "",
          });
        }
        break;
      }

      case "giftcodes": {
        try {
          var page = parseInt(req.query.page) || 1;
          var perPage = 20;
          var offset = (page - 1) * perPage;
          var searchQuery = req.query.search || "";

          var countQuery = "SELECT COUNT(*) AS total FROM giftcode";
          var dataQuery =
            "SELECT * FROM giftcode ORDER BY id DESC LIMIT ? OFFSET ?";
          var countParams = [];
          var dataParams = [perPage, offset];

          if (searchQuery) {
            countQuery =
              "SELECT COUNT(*) AS total FROM giftcode WHERE code LIKE ?";
            dataQuery =
              "SELECT * FROM giftcode WHERE code LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?";
            var searchParam = "%" + searchQuery + "%";
            countParams = [searchParam];
            dataParams = [searchParam, perPage, offset];
          }

          const [countResult, giftcodesResult] = await Promise.all([
            queryDatabase(countQuery, countParams),
            queryDatabase(dataQuery, dataParams),
          ]);

          var totalGiftcodes = countResult[0].total;
          var totalPages = Math.ceil(totalGiftcodes / perPage);

          renderPanel("giftcodes.ejs", {
            pageTitle: "Quản lý Giftcode",
            giftcodes: giftcodesResult,
            totalGiftcodes: totalGiftcodes,
            totalPages: totalPages,
            currentPage: page,
            searchQuery: searchQuery,
          });
        } catch (err) {
          console.error("Giftcodes error:", err);
          renderPanel("giftcodes.ejs", {
            pageTitle: "Quản lý Giftcode",
            giftcodes: [],
            totalGiftcodes: 0,
            totalPages: 0,
            currentPage: 1,
            searchQuery: "",
          });
        }
        break;
      }

      case "bosses": {
        var bossesData = [];
        try {
          var bossesJsonPath = path.join(__dirname, "../../bosses.json");
          if (fs.existsSync(bossesJsonPath)) {
            var content = fs.readFileSync(bossesJsonPath, "utf-8");
            bossesData = JSON.parse(content);
          }
        } catch (e) {
          console.error("Error reading bosses.json:", e);
        }
        renderPanel("bosses.ejs", {
          pageTitle: "Quản lý Boss",
          bosses: bossesData
        });
        break;
      }

      default: {
        res.redirect("/panel/admin?type=home");
      }
    }
  },
};
