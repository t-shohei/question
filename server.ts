import * as http from "http";
import * as fs from "fs";
import * as path from "path";

// uploadファイルの存在確認
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// serverの処理
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    // GETメソッドの時は、デフォのindex.htmlを返す
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      // publicファイルの指定と、URLがデフォ値かどうかチェック
      const filePath: string = path.join(
        __dirname,
        "/public",
        req.url === "/" ? "index.html" : req.url!
      );
      // index,htmlを読み込んでアクセス側に返す
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end("Error");
          return;
        }
        res.end(data);
      });
    }
    // POSTメソッドでuploadにファイル受付
    else if (req.method === "POST" && req.url === "/upload") {
      let body: string = "";
      // 送られてきたもののヘッダー確認（jsonが送られてきてる想定）
      if (req.headers["content-type"] !== "application/json") {
        console.log(req.headers["content-type"]);
        res.statusCode = 400;
        res.end("Content-Typeはapplication/jsonである必要があります");
        return;
      }
      // jsonの時はJSONでbody作成
      req.on("data", (chunk: string) => {
        body += chunk;
      });
      // 最終的にくらいあんとにJSONを返す
      req.on("end", () => {
        console.log(body);
        try {
          const jsonData = JSON.parse(body); // JSONパース
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "データを受け取りました",
              data: jsonData,
            })
          );
        } catch (err) {
          console.error(err);
          res.statusCode = 400;
          res.end("無効なJSONデータです");
        }
      });
    } else {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain");
      res.end("Method Not Allowed");
    }
  }
);

// 8000番ポートでアクセス受付
server.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});
