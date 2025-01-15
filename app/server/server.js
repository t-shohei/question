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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileNum = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mongodb_1 = require("mongodb");
const htmlGenerator_1 = require("../util/htmlGenerator");
const formidable_1 = require("formidable");
const express = require('express');
const app = express();
const port = 8000;
const uri = "mongodb://localhost:27017/questions";
const dbName = "questions";
let db;
mongodb_1.MongoClient.connect(uri)
    .then((client) => {
    db = client.db(dbName);
    console.log("MongoDBに接続しました");
})
    .catch((error) => console.error("MongoDB接続エラー:", error));
const indexPath = path.join(__dirname, "../public/index.html");
const createPath = path.join(__dirname, "../makeQuestion/createQuestion.html");
const questionsDir = path.join(__dirname, "../uploads/questions");
exports.fileNum = 1;
if (!fs.existsSync(questionsDir))
    fs.mkdirSync(questionsDir);
app.get('/', (req, res) => {
    fs.readFile(indexPath, (err, data) => {
        if (err) {
            console.error("ファイル読み込みエラー:", err);
            res.status(500).send("ファイルが見つかりません"); // `res.status`の後に`send`を呼び出してレスポンスを送信
            return;
        }
        res.status(200).type("html").send(data); // 正常なレスポンスを返す
    });
});
app.get('/create', (req, res) => {
    fs.readFile(createPath, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end("ファイルが見つかりません");
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(data);
    });
});
app.get('/uploads/questions/*', (req, res) => {
    const filePath = path.join(__dirname, "../", req.url);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // ファイルが見つからない場合
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("指定されたファイルが見つかりません。");
            return;
        }
        // ファイルを読み込みレスポンスとして返す
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/plain");
                res.end("ファイルの読み込み中にエラーが発生しました。");
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        });
    });
});
app.get('/results', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("結果取得開始");
    const answersCollection = db.collection("answers");
    const result = yield answersCollection.find().toArray();
    console.log(result);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
}));
app.post('/upload', (req, res) => {
    const form = new formidable_1.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.statusCode = 500;
            res.end("フォーム解析エラー");
            return;
        }
        // ファイルを取得
        const uploadedFile = Array.isArray(files.jsonFile)
            ? files.jsonFile[0]
            : files.jsonFile;
        if (!uploadedFile) {
            res.statusCode = 400;
            res.end("JSONファイルが見つかりません");
            return;
        }
        fs.readFile(uploadedFile.filepath, "utf-8", (readErr, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (readErr) {
                res.statusCode = 500;
                res.end("ファイル読み込みエラー");
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                const questionId = yield registQuestion(db, "questions", jsonData);
                console.log(questionId);
                // HTMLファイルを保存し、連番を加算
                const questionHtmlFile = `question${exports.fileNum}.html`;
                exports.fileNum++;
                db.collection("questions").find;
                // アンケートHTMLのファイルのパスを作成
                const htmlFilePath = path.join(questionsDir, questionHtmlFile);
                fs.writeFile(htmlFilePath, (0, htmlGenerator_1.createDynamicHtml)(jsonData, questionId), (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end("ファイル作成エラー");
                        return;
                    }
                });
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                    message: "データを受け取りました",
                    data: jsonData,
                    url: `http://localhost:8000/uploads/questions/${questionHtmlFile}`,
                }));
            }
            catch (parseErr) {
                res.statusCode = 400;
                res.end("無効なJSONデータです");
            }
        }));
    });
});
app.post('/answer', (req, res) => {
    // アンケート回答の送信処理
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("inTry");
            const answerData = JSON.parse(body);
            console.log("server answerData = ", answerData);
            const answersCollection = db.collection("answers");
            // DB保存処理
            const result = yield answersCollection.insertOne(answerData);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
                message: "回答が保存されました",
                id: result.insertedId,
            }));
            console.log("tryEnd:", result);
        }
        catch (parseErr) {
            if (parseErr) {
                console.log(parseErr);
                res.statusCode = 500;
                res.end("データ保存エラー");
                return;
            }
            res.statusCode = 400;
            res.end("無効なデータ形式です");
        }
    }));
});
const registQuestion = (db, collectionName, json) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db.collection(collectionName).insertOne({ json });
    return result.insertedId;
});
// サーバー起動
app.listen(port, () => {
    console.log("Server running at http://localhost:8000");
});
// // サーバー処理
// const server = http.createServer(
//   (req: http.IncomingMessage, res: http.ServerResponse) => {
//     // GETリクエスト
//     if (req.method === "GET") {
//       getRequest(req, res, db);
//     }
//     // POSTリクエスト処理
//     else if (req.method === "POST") {
//       postRequest(req, res, db);
//     }
//   }
// );
