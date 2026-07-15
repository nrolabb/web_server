var { isAdmin } = require("../../middleware/auth.middleware.js");
var config = require("../../config");
var fs = require("fs-extra");
var path = require("path");

module.exports = {
  name: "panel/admin-api",
  method: "post",
  middleware: [isAdmin],
  run: async ({ req, res, sql }) => {
    const queryDatabase = (query, params) => {
      return new Promise((resolve, reject) => {
        sql.query(query, params || [], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    };

    var { action } = req.body;

    try {
      switch (action) {
        case "ban-account": {
          var { accountId, ban } = req.body;
          if (!accountId) return res.json({ success: false, message: "Thiếu accountId" });
          await queryDatabase("UPDATE account SET ban = ? WHERE id = ?", [
            ban ? 1 : 0,
            accountId,
          ]);
          return res.json({ success: true, message: ban ? "Đã ban tài khoản" : "Đã unban tài khoản" });
        }

        case "toggle-admin": {
          var { accountId, isAdmin: adminVal } = req.body;
          if (!accountId) return res.json({ success: false, message: "Thiếu accountId" });
          await queryDatabase("UPDATE account SET is_admin = ? WHERE id = ?", [
            adminVal ? 1 : 0,
            accountId,
          ]);
          return res.json({ success: true, message: adminVal ? "Đã set admin" : "Đã gỡ admin" });
        }

        case "update-vnd": {
          var { accountId, amount } = req.body;
          if (!accountId || !amount || amount <= 0) {
            return res.json({ success: false, message: "Dữ liệu không hợp lệ" });
          }
          await queryDatabase(
            "UPDATE account SET vnd = vnd + ?, tongnap = tongnap + ? WHERE id = ?",
            [amount, amount, accountId]
          );
          return res.json({ success: true, message: "Đã thêm " + amount + " VND" });
        }

        case "delete-account": {
          var { accountId } = req.body;
          if (!accountId) return res.json({ success: false, message: "Thiếu accountId" });
          await queryDatabase("DELETE FROM player WHERE account_id = ?", [accountId]);
          await queryDatabase("DELETE FROM account WHERE id = ?", [accountId]);
          return res.json({ success: true, message: "Đã xóa tài khoản" });
        }

        case "refresh-logs": {
          var { logType } = req.body;
          var filename = logType === "error" ? "server-error.log" : "server.log";
          try {
            var logPath = path.join(config.logPath, filename);
            if (!fs.existsSync(logPath)) {
              return res.json({ success: true, lines: ["[Info] Log file not found: " + filename] });
            }
            var content = fs.readFileSync(logPath, "utf-8");
            var lines = content
              .split("\n")
              .filter(function (l) {
                return l.trim() !== "";
              })
              .slice(-config.maxLogLines);
            return res.json({ success: true, lines: lines });
          } catch (err) {
            return res.json({ success: false, message: "Lỗi đọc file log: " + err.message });
          }
        }

        case "player-detail": {
          var { playerId } = req.body;
          if (!playerId) return res.json({ success: false, message: "Thiếu playerId" });
          var results = await queryDatabase(
            "SELECT p.*, a.username AS account_username FROM player p LEFT JOIN account a ON p.account_id = a.id WHERE p.id = ?",
            [playerId]
          );
          if (results.length === 0) {
            return res.json({ success: false, message: "Không tìm thấy player" });
          }
          return res.json({ success: true, player: results[0] });
        }

        case "spawn-boss": {
          var { bossId } = req.body;
          if (bossId === undefined || bossId === null || bossId === "") return res.json({ success: false, message: "Thiếu bossId" });
          
          await queryDatabase(
            "INSERT INTO admin_command (command_name, command_value) VALUES (?, ?)",
            ["SPAWN_BOSS", bossId.toString()]
          );
          return res.json({ success: true, message: "Đã gửi lệnh Spawn Boss thành công!" });
        }

        default:
          return res.json({ success: false, message: "Action không hợp lệ" });
      }
    } catch (err) {
      console.error("Admin API error:", err);
      return res.json({ success: false, message: "Lỗi server: " + err.message });
    }
  },
};
