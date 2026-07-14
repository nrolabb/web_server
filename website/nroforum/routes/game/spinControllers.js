const { isLogin } = require("../../middleware/auth.middleware");
const fs = require("fs-extra");

var items = JSON.parse(fs.readFileSync(__dirname + "/listItem.json"));

// Icon trên vòng quay được xếp cùng thứ tự với danh sách phần thưởng.
const rewardIcons = [
  "MxrStMQ.png", "cFbZyHg.png", "J6Q30Tz.png", "byPkOwR.png",
  "02YbcFI.png", "SaQYFBU.png", "ZwxlZQw.png", "tdEvIFz.png",
  "Wch0Xo8.png", "l3fr7CW.png", "NtTiHP8.png", "55EQLjI.png",
  "tXexoPJ.png", "QbufFVD.png", "cGEiQkq.png"
];

module.exports = {
  name: "spin",
  method: "POST",
  middleware: [isLogin],
  run: async ({ res, user, req }) => {
    var currentTimestamp = new Date().getTime();
    const { type } = req.body;
    const spinType = type === "x10" ? "x10" : "x1";
    const spins = spinType === "x10" ? 10 : 1;
    // Chi phí: 1 lần quay = 1000, 10 lần quay = 9000
    const cost = spinType === "x10" ? 9000 : 1000;

    const info = await user.getInfo();
    if (info[0]?.username) {
      const getUser = info[0];
      if (getUser.vnd < cost) {
        return res.json({
          error: true,
          message: `Bạn không đủ số dư! Cần ${cost.toLocaleString()} VNĐ để quay ${spins} lần.`
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
        selectedItems.push({
          ...selectedItem,
          img: selectedItem.img || `/assets/images/spin/${rewardIcons[selectedItemIndex % rewardIcons.length]}`
        });
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

        const insertSpinQuery = 'INSERT INTO spin (type, account_id, code, name, time_stamps) VALUES (?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
          sql.query(insertSpinQuery, [spinType, getUser.id, giftCode, selectedItem.name, currentTimestamp], (err, rs) => {
            if (err) {
              console.error("Lỗi khi thêm dữ liệu vào bảng spin:", err);
              reject(err);
            }
            resolve();
          });
        });
      }

      // Chỉ giữ lại 200 lượt quay mới nhất trên toàn hệ thống.
      await new Promise((resolve, reject) => {
        sql.query('SELECT COUNT(*) AS total FROM spin', (countErr, countRows) => {
          if (countErr) return reject(countErr);

          const excessRows = Math.max(0, Number(countRows[0]?.total || 0) - 200);
          if (excessRows === 0) return resolve();

          sql.query(
            `DELETE FROM spin ORDER BY time_stamps ASC LIMIT ${excessRows}`,
            (deleteErr) => {
              if (deleteErr) return reject(deleteErr);
              resolve();
            }
          );
        });
      });

      // Trừ số dư VNĐ thay vì thoi_vang
      const newBalance = getUser.vnd - cost;
      await new Promise((resolve, reject) => {
        sql.query(`UPDATE account SET vnd = ? WHERE username = ?`, [newBalance, getUser.username], (err, r) => {
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
        giftCodes: giftCodes,
        newBalance: newBalance
      });
    } else {
      return res.json({
        error: true,
        message: "Bạn chưa đăng nhập!"
      });
    }
  }
};
