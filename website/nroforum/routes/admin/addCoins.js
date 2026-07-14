const { isAdmin } = require("../../middleware/auth.middleware");

module.exports = {
  name: "admin/addCoins",
  middleware: [isAdmin],
  method: "post",
  run: ({ req, res }) => {
    var { username, coins } = req.body;

    if (!username || !coins) {
      return res.json({
        error: true,
        message: "Tên người dùng và số coins là bắt buộc.",
      });
    }

    // Query the user's current vnd value
    global.sql.query("SELECT * FROM account WHERE username = ?", [username], (err, results) => {
      if (err) {
        console.error("Lỗi khi kiểm tra user:", err);
        return res.json({
          error: true,
          message: "Lỗi khi kiểm tra user",
        });
      }

      if (results.length === 0) {
        return res.json({
          error: true,
          message: "Người dùng không tồn tại.",
        });
      }

      const currentUser = results[0];
      const currentCoins = currentUser.vnd || 0;

      const newCoins = currentCoins + parseInt(coins);

      global.sql.query("UPDATE account SET vnd = ? WHERE username = ?", [newCoins, username], (updateErr) => {
        if (updateErr) {
          console.error("Lỗi khi cập nhật số coins:", updateErr);
          return res.json({
            error: true,
            message: "Lỗi khi cập nhật số coins",
          });
        }

        res.json({
          error: false,
          message: `Đã thêm ${coins} vnđ vào tài khoản của ${username}.`,
        });
      });
    });
  },
};
