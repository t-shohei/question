"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mongodb_1 = require("mongodb");
// import { dbConnect } from "../util/dbConnect";
const getRequest_1 = require("./request/getRequest");
const postRequest_1 = require("./request/postRequest");
const uri = "mongodb://localhost:27017/question";
const dbName = "questions";
const collectionName = "question";
let db;
mongodb_1.MongoClient.connect(uri)
    .then((client) => {
    db = client.db(dbName);
    console.log("MongoDBに接続しました");
})
    .catch((error) => console.error("MongoDB接続エラー:", error));
// アップロードディレクトリの確認または作成
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir))
    fs.mkdirSync(uploadsDir);
// サーバー処理
const server = http.createServer((req, res) => {
    // GETリクエスト
    if (req.method === "GET") {
        (0, getRequest_1.getRequest)(req, res, db);
    }
    // POSTリクエスト処理
    else if (req.method === "POST") {
        (0, postRequest_1.postRequest)(req, res, db);
    }
});
// サーバー起動
server.listen(8000, () => {
    console.log("Server running at http://localhost:8000");
});
