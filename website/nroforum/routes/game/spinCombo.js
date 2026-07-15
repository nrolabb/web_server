const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "spin-combo",
  method: "GET",
  run: async ({ req, res }) => {
    const code = req.query.code;
    if (!code) return res.json({ error: true });
    const filePath = path.join(__dirname, "combo_data", code + ".json");
    if (fs.existsSync(filePath)) {
       return res.json({ error: false, data: JSON.parse(fs.readFileSync(filePath)) });
    }
    return res.json({ error: true, message: "Không tìm thấy dữ liệu combo" });
  }
};
