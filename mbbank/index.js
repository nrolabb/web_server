const mbbank = require("./helper/mbbank");
const mysql = require("mysql");
const config = require("./config")
require('dotenv').config()
process.on("unhandledRejection", err => console.log(err));
process.on("uncaughtException", err => console.log(err));
const connection = mysql.createConnection(config.database);
connection.connect((err) => {
    if (err) {
        console.error("Lỗi kết nối đến cơ sở dữ liệu:", err);
        return;
    }
    console.log("Kết nối thành công đến cơ sở dữ liệu MySQL");
});
global.sql = connection;
(async () => {
    const loginMB = new mbbank();
    await loginMB.login()
    loginMB.run();
})()

