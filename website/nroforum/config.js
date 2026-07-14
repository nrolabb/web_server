module.exports = {
    port : process.env.PORT || 3000,
    database: {
        host: "localhost",
        database : "nro_arn",
        user: "nro_app",
        password: "Quang@9355",
        port: 3306
    },
    active_coins: 20000,
    thesieure: {
        partner_key: "f8b4d5afdf53fa0664ad1fd317ef085d",
        partner_id: "16756218943"
    },
    jwt_secretkey: "NroYunaJWT"
}