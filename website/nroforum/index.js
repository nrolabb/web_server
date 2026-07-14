const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const config = require("./config");
const bodyParser = require("body-parser");
const middleware = require("./middleware/index");
const app = express();
const port = config.port;
const path = require("path");
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const minifyHTML = require('express-minify-html');
const htmlMinifier = require('html-minifier');
require('dotenv').config()

process.on("unhandledRejection", err => console.log(err));
process.on("uncaughtException", err => console.log(err));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.setHeader("x-csrf-token", crypto.randomBytes(32).toString('hex'));
  next();
});

// app.use(async function (req, res, next) {
//   if(!checkFunction(req.url)) {
//       next();
//   } else {
//       res.status(404).send(`<script>alert('Học ăn học nói, học đâu cái thói trộm cắp ?');window.location.href = '${Buffer.from("aHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL1RoaWV1VHJ1bmdLaTNuLw==", 'base64').toString('utf-8')}'</script>`)
//   }
// })

// var checkFunction = (url) => {
//  var blockedUrl = ['/assets/css/style.css', '/assets/css/main.css', '/assets/js/detect.js', '/assets/js/main.js'];

//  return blockedUrl.find(function(urlCheck){
//       return urlCheck === url;
//  })
// }

// Cho phép truy cập vào tài nguyên tĩnh trong thư mục /views/assets
app.use("/assets", express.static(path.join(__dirname, "/views/assets")));
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));

app.use(minifyHTML({
  override: true,
  exception_url: false,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    useShortDoctype: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyURLs: true
  }
}));

app.use((req, res, next) => {
  const originalRender = res.render;

  res.render = function (view, options, callback) {
    originalRender.call(this, view, options, (err, html) => {
      if (err) {
        console.error(err);
        res.clearCookie("signature");
        res.clearCookie("username");
        return res.status(500).send('Error rendering template');
      }

      const minifiedHtml = htmlMinifier.minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        caseSensitive: true,
        customAttrAssign: true,
        minifyCSS: true
      });

      res.send(minifiedHtml);
    });
  };

  next();
});

const connection = mysql.createConnection(config.database);
connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối đến cơ sở dữ liệu:", err);
    return;
  }
  console.log("Kết nối thành công đến cơ sở dữ liệu MySQL");
});

global.sql = connection;
app.listen(port, async () => {
  middleware({ app, sql: connection });
});
