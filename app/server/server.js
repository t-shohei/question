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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const formidable_1 = require("formidable");
const htmlGenerator_1 = require("../util/htmlGenerator");
const mongoose_1 = require("mongoose");
const express_1 = __importDefault(require("express"));
// Expressの設定
const app = (0, express_1.default)();
const port = 8000;
const dbName = "questionAnswer";
const uri = `mongodb://questionAnswer:89248924@localhost:27017/${dbName}`;
// Mongooseの接続
(0, mongoose_1.connect)(uri)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Connection error:', err));
const questionSchema = new mongoose_1.Schema({
    json: { type: Object, required: true }
});
const answerSchema = new mongoose_1.Schema({
    questionId: String,
    question_title: String,
    answers: [Object],
});
const Question = (0, mongoose_1.model)('Question', questionSchema);
const Answer = (0, mongoose_1.model)('Answer', answerSchema);
let fileNum = 1;
const indexPath = path.join(__dirname, "../public/index.html");
const createPath = path.join(__dirname, "../makeQuestion/createQuestion.html");
const questionsDir = path.join(__dirname, "../uploads/questions");
if (!fs.existsSync(questionsDir))
    fs.mkdirSync(questionsDir);
// 画面遷移系
app.get('/', (req, res) => {
    fs.readFile(indexPath, (err, data) => {
        if (err) {
            res.status(500).send("ファイルが見つかりません");
            return;
        }
        res.status(200).setHeader("Content-Type", "text/html").end(data);
    });
});
app.get('/create', (req, res) => {
    fs.readFile(createPath, (err, data) => {
        if (err) {
            res.status(500).send("ファイルが見つかりません");
            return;
        }
        res.status(200).setHeader("Content-Type", "text/html").end(data);
    });
});
app.get('/uploads/questions/*', (req, res) => {
    const filePath = path.join(__dirname, "../", req.url);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).setHeader("Content-Type", "text/plain").send("指定されたファイルが見つかりません。");
            return;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(500).setHeader("Content-Type", "text/plain").send("ファイルの読み込み中にエラーが発生しました。");
                return;
            }
            res.status(200).setHeader("Content-Type", "text/html").end(data);
        });
    });
});
// 処理系
app.get('/results', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("結果取得開始");
    try {
        const answersResult = yield Answer.find({ question_title: "飲みかい日程" }).exec();
        const questionResult = yield Question.find({ _id: (_a = answersResult[0]) === null || _a === void 0 ? void 0 : _a.questionId }).exec();
        console.log(JSON.stringify(questionResult)[0]);
        console.log(answersResult);
        res.status(200).json({
            ans: answersResult,
            question: questionResult
        });
    }
    catch (error) {
        res.status(500).send("結果取得エラー");
    }
}));
app.post('/upload', (req, res) => {
    const form = new formidable_1.IncomingForm();
    form.parse(req, (err, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(500).send("フォーム解析エラー");
            return;
        }
        const uploadedFile = Array.isArray(files.jsonFile) ? files.jsonFile[0] : files.jsonFile;
        if (!uploadedFile) {
            res.status(400).send("JSONファイルが見つかりません");
            return;
        }
        fs.readFile(uploadedFile.filepath, "utf-8", (readErr, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (readErr) {
                res.status(500).send("ファイル読み込みエラー");
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                const question = new Question({ json: jsonData });
                const savedQuestion = yield question.save();
                // HTMLファイルを保存し、連番を加算
                const questionHtmlFile = `question${fileNum}.html`;
                fileNum++;
                const htmlFilePath = path.join(questionsDir, questionHtmlFile);
                fs.writeFile(htmlFilePath, (0, htmlGenerator_1.createDynamicHtml)(jsonData, savedQuestion._id), (err) => {
                    if (err) {
                        res.status(500).send("ファイル作成エラー");
                        return;
                    }
                });
                res.status(200).json({
                    message: "データを受け取りました",
                    data: jsonData,
                    url: `http://localhost:8000/uploads/questions/${questionHtmlFile}`,
                });
            }
            catch (parseErr) {
                res.status(400).send("無効なJSONデータです");
            }
        }));
    }));
});
app.post('/answer', (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("inTry");
            const answerData = JSON.parse(body);
            const answer = new Answer(answerData);
            const result = yield answer.save();
            res.status(200).json({
                message: "回答が保存されました",
                id: result._id,
            });
            console.log("tryEnd:", result);
        }
        catch (parseErr) {
            if (parseErr) {
                console.log(parseErr);
                res.status(500).send("データ保存エラー");
                return;
            }
            res.status(400).send("無効なデータ形式です");
        }
    }));
});
// サーバー起動
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
