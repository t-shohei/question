"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var path = require("path");
var server = http.createServer(function (req, res) {
    if (req.method === "GET") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        var filePath = path.join(__dirname, "/public", req.url === "/" ? "index.html" : req.url);
        fs.readFile(filePath, "utf-8", function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end("Error");
                return;
            }
            res.end(data);
        });
    }
    else if (req.method === "POST" && req.url === "/upload") {
        var body_1 = "";
        if (req.headers['content-type'] !== 'application/json') {
            console.log(req.headers["content-type"]);
            res.statusCode = 400;
            res.end("Content-Typeはapplication/jsonである必要があります");
            return;
        }
        req.on("data", function (chunk) {
            body_1 += chunk;
        });
        req.on("end", function () {
            console.log(body_1);
            try {
                var jsonData = JSON.parse(body_1); // JSONパース
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                    message: "データを受け取りました",
                    data: jsonData,
                }));
            }
            catch (err) {
                console.error(err);
                res.statusCode = 400;
                res.end("無効なJSONデータです");
            }
        });
    }
    else {
        res.statusCode = 405;
        res.setHeader("Content-Type", "text/plain");
        res.end("Method Not Allowed");
    }
});
server.listen(8000, function () {
    console.log("Server running at http://localhost:8000");
});
