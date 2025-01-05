import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { MongoClient } from "mongodb";

// import { dbConnect } from "../util/dbConnect";
import { getRequest } from "./request/getRequest";
import { postRequest } from "./request/postRequest";

const uri = "mongodb://localhost:27017/question";
const dbName = "questions";
const collectionName = "question";
let db: any;

MongoClient.connect(uri)
  .then((client) => {
    db = client.db(dbName);
    console.log("MongoDBに接続しました");
  })
  .catch((error) => console.error("MongoDB接続エラー:", error));



// アップロードディレクトリの確認または作成
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// サーバー処理
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    // GETリクエスト
    if (req.method === "GET") {
      getRequest(req, res, db);
    }
    // POSTリクエスト処理
    else if (req.method === "POST") {
      postRequest(req, res, db);
    }
  }
);

// サーバー起動
server.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});
