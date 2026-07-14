const { isLogin } = require("../../middleware/auth.middleware");
const fs = require("fs-extra");

var items = JSON.parse(fs.readFileSync(__dirname + "/listItem.json"));

module.exports = {
  name: "spin",
  method: "POST",
  middleware: [isLogin],
  run: async ({ res, user, req }) => {
    var currentTimestamp = new Date().getTime();
    const { type } = req.body;
    const spins = type === "x10" ? 10 : 1;

    const info = await user.getInfo();
    if (info[0]?.username) {
      const getUser = info[0];
      if (getUser.thoi_vang < spins) {
        return res.json({
          error: true,
          message: "Bạn không có đủ lượt quay!"
        });
      }

      const totalRatio = items.reduce((acc, item) => acc + item.ratio, 0);
      const ratioArray = [];

      items.forEach((item, index) => {
        for (let i = 0; i < item.ratio; i++) {
          ratioArray.push(index);
        }
      });

      const selectedItems = [];
      for (let i = 0; i < spins; i++) {
        const randomIndex = Math.floor(Math.random() * totalRatio);
        const selectedItemIndex = ratioArray[randomIndex];
        const selectedItem = items[selectedItemIndex];
        selectedItems.push(selectedItem);
      }

      function generateGiftCode(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters[randomIndex];
        }

        return result;
      }

      const giftCodes = [];
      for (const selectedItem of selectedItems) {
        const giftCode = generateGiftCode(10);
        giftCodes.push(giftCode);
        const insertUserQuery = 'INSERT INTO giftcode (code, count_left, detail) VALUES (?, ?, ?)';
        await new Promise((resolve, reject) => {
          sql.query(insertUserQuery, [giftCode, 1, JSON.stringify([selectedItem.params])], (err, insertResult) => {
            if (err) {
              console.error("Lỗi khi thêm dữ liệu vào bảng gift_codes:", err);
              reject(err);
            }
            resolve();
          });
        });

        const insertSpinQuery = 'INSERT INTO spin (account_id, code, name, time_stamps) VALUES (?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
          sql.query(insertSpinQuery, [getUser.id, giftCode, selectedItem.name, currentTimestamp], (err, rs) => {
            if (err) {
              console.error("Lỗi khi thêm dữ liệu vào bảng spin:", err);
              reject(err);
            }
            resolve();
          });
        });
      }

      await new Promise((resolve, reject) => {
        sql.query(`UPDATE account SET thoi_vang = ? WHERE username = ?`, [(getUser.thoi_vang - spins), getUser.username], (err, r) => {
          if (err) {
            console.error("Lỗi khi cập nhật dữ liệu trong bảng account:", err);
            reject(err);
          }
          resolve();
        });
      });

      return res.json({
        error: false,
        data: selectedItems,
        giftCodes: giftCodes
      });
    } else {
      return res.json({
        error: true,
        message: "Bạn chưa đăng nhập!"
      });
    }
  }
};