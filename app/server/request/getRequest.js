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
exports.getRequest = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// GET処理
const getRequest = (req, res, db) => {
    var _a;
    // Topページの表示
    const indexPath = path.join(__dirname, "../../public/index.html");
    if (req.url === "/") {
        fs.readFile(indexPath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("ファイルが見つかりません");
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        });
    }
    // アンけートページの表示
    else if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/uploads/questions/")) {
        const filePath = path.join(__dirname, "../../", req.url);
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
    }
    // 結果の取得
    else if (req.url === "/results") {
        const answersCollection = db.collection("answers");
        answersCollection.find({}).toArray((err, answers) => {
            if (err) {
                res.statusCode = 500;
                res.end("データ取得エラー");
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(answers));
        });
    }
    // その他のGETリクエスト
    else {
        res.statusCode = 404;
        res.end("Not Found");
    }
};
exports.getRequest = getRequest;
