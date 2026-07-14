const utils = require("./utils");

class MBBankInstance extends utils {
  constructor() {
    super();
    this.array = [];
    this.prefix = "dragonsuper"
  }

  delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getPreviousDay() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return this.formatDate(yesterday);
  }

  getCurrentDay() {
    const today = new Date();
    return this.formatDate(today);
  }

  async processTransaction(i, refNo, creditAmount, addDescription) {
    return new Promise((resolve, reject) => {
      global.sql.query("SELECT * FROM atm_check WHERE tranid = ?", [refNo], (err, results) => {
        if (err) {
          console.error("Lỗi khi kiểm tra tranid:", err);
          return reject(err);
        }
        if (Array.from(results).length > 0) {
          resolve();
        } else {
          addDescription = addDescription.toLowerCase();
          const matchDescription = addDescription.indexOf("dragonlight");
          let username = false;
    
          if (addDescription.includes("qr-")) {
            username = addDescription.slice(matchDescription + "dragonlight".length).replace(/\s+/g, '');
          } else {
            username = addDescription.slice(matchDescription + "dragonlight".length).replace(/\s+/g, '');
            username = username.slice(0, username.indexOf("-magiaodich"));
          }
          if (!username) {
            return resolve()
          }
          username = username.trim().replace(/\s+/g, '')
          console.log({ refNo, username, addDescription })
          global.sql.query("SELECT * FROM account WHERE username = ?", [username], (err, result) => {
            if (err) {
              console.error("Lỗi khi kiểm tra user (mbbank):", err);
              return reject(err);
            }
            if (!result.length) {
              resolve();
            } else {
              global.sql.query("INSERT INTO atm_check (tranid, username, sotien, thoigian) VALUES (?, ?, ?, ?)", [refNo, username, creditAmount, Date.now()], (err, results) => {
                if (err) {
                  console.error("Lỗi khi thêm vào bảng atm_check (mbbank):", err);
                  return reject(err);
                }
                global.sql.query("UPDATE account SET vnd = ?, tongnap = ? WHERE username = ?", [(parseInt(result[0].vnd) + parseInt(creditAmount)), (parseInt(result[0].tongnap) + parseInt(creditAmount)), username], (updateErr) => {
                  if (updateErr) {
                    console.error("Lỗi khi cập nhật số tiền (mbbank):", updateErr);
                    return reject(updateErr);
                  }
                  let luotQuay = Math.floor(creditAmount / 10000);
                  if (luotQuay > 0) {
                    global.sql.query("UPDATE account SET thoi_vang = ? WHERE username = ?", [(parseInt(result[0].thoi_vang) + parseInt(luotQuay)), username], (updateErr) => {
                      if (updateErr) {
                        console.error("Lỗi khi cập nhật số lượt quay (mbbank):", updateErr);
                        return reject(updateErr);
                      }
                      console.log(`NGƯỜI DÙNG : ${username} vừa nạp ${creditAmount} !, ${luotQuay} lượt quay !`);
                      resolve();
                    });
                  } else {
                    console.log(`NGƯỜI DÙNG : ${username} vừa nạp ${creditAmount} !`);
                    resolve();
                  }
                });
              });
            }
          });
        }
      });
    });
  }

  async run() {
    try {
      while (true) {
        var lsgd = await this.getTransHistory(this.getCurrentDay(), this.getCurrentDay());
        if (lsgd.transactionHistoryList == null) {
          console.log({ type: "mbbank", msg: "Không tìm thấy lịch sử giao dịch !" });
        }
        else {
          console.log({ balance: lsgd.transactionHistoryList[0].availableBalance });
          if (lsgd.result.message == "Success") {
            for (let i of lsgd.transactionHistoryList) {
              if (i.creditAmount > 0) {
                var { refNo, creditAmount, addDescription } = i;
                creditAmount = parseInt(creditAmount);
                let promotionalBonus = creditAmount * 0.2;
                creditAmount += promotionalBonus;
                await this.processTransaction(i, refNo, creditAmount, addDescription);
              }
            }
          }
        }
        await this.delay(10000);
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = MBBankInstance;
