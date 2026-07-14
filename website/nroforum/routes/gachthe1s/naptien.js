var crypto = require("crypto");
var axios = require("axios")
var config = require("../../config")
var { isLogin } = require("../../middleware/auth.middleware")

module.exports = {
    name: "gachthe1s/guithe",
    middleware: [isLogin],
    method: "post",
    run: async ({ req, res, user }) => {
        try {
            const queryDatabase = (query, params) => {
                return new Promise((resolve, reject) => {
                    global.sql.query(query, params, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
            };
            var { serial, code, amount, telco } = req.body;
            if (!serial || !code || !amount || !telco) {
                return res.json({
                    error: true,
                    message: "Invaild Params"
                })
            }
            var user = await user.getInfo();
            if (!user.length) {
                res.redirect("/login")
            }
            var [checkPin, checkSerial] = await Promise.all([
                queryDatabase("SELECT * FROM napthe WHERE code = ?", [code]),
                queryDatabase("SELECT * FROM napthe WHERE serial = ?", [serial])
            ])
            if(checkPin.length >= 2 || checkSerial.length >= 2){
                return res.json({
                    error: true,
                    message: "Thẻ đã tồn tại trên hệ thống, vui lòng liên hệ admin !"
                })
            }
            const hash = crypto.createHash("md5").update(config.thesieure.partner_key + code + serial).digest("hex");
            var requestID = Math.random() * (999999999 - 10000000) + 10000000
            var form = {
                request_id: requestID,
                telco,
                code,
                serial,
                amount,
                partner_id: config.thesieure.partner_id,
                sign: hash,
                command: 'charging'
            }
            axios({
                method: "POST",
                url: "https://gachthe1s.com/chargingws/v2",
                data: form,
                headers: {
                    'content-type': 'application/json'
                }
            }).then(body => {
                console.log(body)
                var status = [
                    {
                        status: "PENDING",
                        message: "Gửi thẻ thành công, đợi duyệt!",
                        error: false
                    },
                    {
                        status: "charging.invalid_card_code",
                        message: "Mã thẻ không hợp lệ!",
                        error: true
                    },
                    {
                        status: "charging.card_existed",
                        message: "Thẻ đã tồn tại trên hệ thống!",
                        error: true
                    }
                ]
                var data = status.find(i => i.status == body.data.message);
                if (data.status == "PENDING") {
                    const insertUserQuery = `INSERT INTO napthe (user_nap, telco, serial, code, amount, status, request_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    global.sql.query(insertUserQuery, [user[0].username, telco, serial, code, amount, 0, body.data.trans_id], (updateErr) => {
                        if (updateErr) {
                            console.error("Lỗi khi them the cao:", updateErr);
                            return res.json({
                                error: true,
                                message: "Lỗi khi thêm thẻ cào",
                            });
                        }
                    })
                }
                return res.json({
                    error: data.error,
                    message: data.message
                })
            }).catch(err => {
                console.log(err);
                return res.json({
                    error: true,
                    message: "Đã xảy ra lỗi tại hệ thống!",
                });
            })
        } catch (err) {
            console.log(err);
            return res.json({
                error: true,
                message: "Đã xảy ra lỗi tại hệ thống!",
            });
        }
    }
};
