const { isLogin, isAdmin } = require("../../middleware/auth.middleware")


module.exports = {
    name: "spin",
    method: "GET",
    middleware: [isLogin],
    run: async ({ req, res, user, options }) => {
        const userInfo = await user.getInfo();
        
        // Lấy lịch sử quay gần nhất (50 bản ghi) kèm username từ bảng account
        const spinHistory = await new Promise((resolve, reject) => {
            sql.query(
                `SELECT s.*, a.username FROM spin s 
                 LEFT JOIN account a ON s.account_id = a.id 
                 ORDER BY s.time_stamps DESC 
                 LIMIT 50`,
                (err, results) => {
                    if (err) {
                        console.error("Lỗi khi lấy lịch sử quay:", err);
                        resolve([]);
                    }
                    resolve(results || []);
                }
            );
        });

        res.render("page/spin.ejs", {
            user: userInfo,
            options,
            spinHistory: spinHistory
        })
    },
}