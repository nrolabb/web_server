module.exports = {
  name: "gachthe1s/webhook",
  middleware: [],
  method: "post",
  run: async ({ req }) => {
    var { trans_id, value, status, code } = req.body
    console.log(req.body)
    global.sql.query("SELECT * FROM trans_log WHERE trans_id = ?", [trans_id], (err, data) => {
      if (err) {
        console.log("error: " + code);
      }
      if (data.length === 0) {
        return;
      }
      global.sql.query("UPDATE trans_log SET status = ? WHERE pin = ?", [status, code], (err, results) => {
        if (err) {
          console.log("error: " + code)
        }
        if (status == 1) {
          global.sql.query("SELECT * FROM account WHERE username = ?", [data[0].name], async (err, user) => {
            if (!user.length) return;
            if (err) {
              return console.log("Xay ra loi trong trans_log : " + err);
            }
            const currentUser = user[0];
            const currentCoins = currentUser.vnd || 0;

            const newCoins = currentCoins + parseInt(value);
            global.sql.query("UPDATE account SET vnd = ?, tongnap = ? WHERE username = ?", [(parseInt(newCoins) * 0.2), newCoins, data[0].username], (err, results) => {
              if (err) {
                console.log("ERROR ADD COINS WEBHOOK")
              }
              let luotQuay = Math.floor(newCoins / 5000);
              if (luotQuay > 0) {
                global.sql.query("UPDATE account SET thoi_vang = ? WHERE username = ?", [(parseInt(user[0].thoi_vang) + parseInt(luotQuay)), data[0].username], (updateErr) => {
                  if (updateErr) {
                    console.error("Lỗi khi cập nhật số lượt quay (gachthe1s):", updateErr);
                    return;
                  }
                  console.log({
                    message: "Nap tien thanh cong",
                    username: user[0].username,
                    value: value,
                    spin: luotQuay
                  });
                })
              }
              console.log({
                message: "Nap tien thanh cong",
                username: user[0].username,
                value: value
              })
            });
          })
        }
      })
    })
  },
};
