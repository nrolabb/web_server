module.exports = {
    name: "bxh",
    method: "GET",
    middleware: [],
    run: async ({ req, res, user, options, next }) => {
        try {
            var { type } = req.query
            var typeFilter = ["0", "1", "2"];
            if (!typeFilter.includes(type)) {
                type = 0;
            }
            var queryDatabase = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query(query, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
            };
            var [topUsersResult, topReCharge, topQuest] = await Promise.all([
                queryDatabase("SELECT * FROM player ORDER BY JSON_EXTRACT(data_point, '$[1]') DESC LIMIT 10"),
                queryDatabase("SELECT * FROM account ORDER BY (tongnap) DESC LIMIT 10"),
                queryDatabase(`
                SELECT *
                FROM player
                ORDER BY JSON_EXTRACT(data_task, '$[0]') DESC,
                         CASE WHEN JSON_EXTRACT(data_task, '$[0]') = JSON_EXTRACT(data_task, '$[0]', '$[1]') THEN JSON_EXTRACT(data_task, '$[1]') ELSE NULL END DESC
                LIMIT 10;
                `)
            ]);
            res.render("page/bxh.ejs", {
                user: await user.getInfo(),
                type,
                options,
                allUser: topUsersResult,
                topReCharge,
                topQuest
            });
        } catch (err) {
            next(err);
        }
    },
};
