require("dotenv").config();

module.exports = {
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT) || 3000,
    database: {
        host: process.env.DB_HOST || "127.0.0.1",
        database: process.env.DB_NAME || "nro_arn",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        port: Number(process.env.DB_PORT) || 3306
    },
    sidebar: [
        { name: "Trang chủ", path: "/", icon: "" },
        { name: "Nạp tiền", path: "/naptien", icon: "" },
        { name: "Lịch sử", path: "/history", icon: "" },
        { name: "Vòng quay", path: "/spin", icon: "" },
        { name: "Hồ sơ", path: "/profile", icon: "" },
        { name: "Admin", path: "/panel/admin?type=home", icon: "" }
    ],
    active_coins: 20000,
    thesieure: {
        partner_key: "f8b4d5afdf53fa0664ad1fd317ef085d",
        partner_id: "16756218943"
    },
    jwt_secretkey: "NroYunaJWT",
    logPath: "c:\\NROServer\\logs",
    maxLogLines: 500
}
