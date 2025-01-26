import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { MongoClient } from "mongodb";
import { createDynamicHtml } from "../util/htmlGenerator";
import { IncomingForm } from "formidable";
const express = require('express')
const app = express()
const port = 8000

const mongose = require('mongoose');

const uri = 'mongodb://admin:admin123@localhost:27017/'

// const uri = "mongodb://localhost:27017/questions";
const dbName = "questions";
let db: any;

// const mongoose = require('mongoose');

// const uri = 'mongodb://admin:your_password@<ホストIP>:27017/mydatabase';
mongose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB!'))
  // .catch(err: any => console.error('Connection error:', err));



// MongoClient.connect(uri)
//   .then((client) => {
//     db = client.db(dbName);
//     console.log("MongoDBに接続しました");
//   })
//   .catch((error) => console.error("MongoDB接続エラー:", error));

  let fileNum = 1;
const indexPath = path.join(__dirname, "../public/index.html");
const createPath = path.join(__dirname, "../makeQuestion/createQuestion.html");
const questionsDir = path.join(__dirname, "../uploads/questions");
if (!fs.existsSync(questionsDir)) fs.mkdirSync(questionsDir);
app.get('/',(req: http.IncomingMessage, res: any) => {
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
})
app.get('/create', (req:any, res: any) => {
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
})
app.get('/uploads/questions/*', (req: any, res: any) =>{
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
app.get('/results',async(req:any, res:any) => {
  console.log("結果取得開始");

  const answersCollection = db.collection("answers");
  const questionCollection = db.collection('questions')
  const answerResult = await answersCollection.find({question_title: "飲みかい日程"}).toArray();
  const questionResult = await questionCollection.find({questionId : answerResult.questionId}).toArray();

  console.log( JSON.stringify(questionResult)[0] );
  console.log(answerResult);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({
    ans: answerResult,
    question: questionResult
  }));
})
app.post('/upload',(req:any,res:any)=>{
  const form = new IncomingForm();
    form.parse(req, (err:any, fields:any, files:any) => {
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

      fs.readFile(uploadedFile.filepath, "utf-8", async (readErr, data) => {
        if (readErr) {
          res.statusCode = 500;
          res.end("ファイル読み込みエラー");
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          const questionId = await registQuestion(db, "questions", jsonData);
          console.log(questionId);
          // HTMLファイルを保存し、連番を加算
          const questionHtmlFile = `question${fileNum}.html`;
          fileNum++;
          db.collection("questions").find;
          // アンケートHTMLのファイルのパスを作成
          const htmlFilePath = path.join(questionsDir, questionHtmlFile);
          console.log(htmlFilePath);
          fs.writeFile(
            htmlFilePath,
            createDynamicHtml(jsonData, questionId),
            (err) => {
              if (err) {
                res.statusCode = 500;
                res.end("ファイル作成エラー");
                return;
              }
            }
          );
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "データを受け取りました",
              data: jsonData,
              url: `http://localhost:8000/uploads/questions/${questionHtmlFile}`,
            })
          );
        } catch (parseErr) {
          res.statusCode = 400;
          res.end("無効なJSONデータです");
        }
      });
    });
})
app.post('/answer',(req: any,res: any) => {
      // アンケート回答の送信処理
      let body = "";
      req.on("data", (chunk: any) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          console.log("inTry");
          const answerData = JSON.parse(body);
          const answersCollection = db.collection("answers");
          // DB保存処理
          const result = await answersCollection.insertOne(answerData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "回答が保存されました",
              id: result.insertedId,
            })
          );
          console.log("tryEnd:", result);
        } catch (parseErr) {
          if (parseErr) {
            console.log(parseErr);
            res.statusCode = 500;
            res.end("データ保存エラー");
            return;
          }
          res.statusCode = 400;
          res.end("無効なデータ形式です");
        }
      });
})




const registQuestion = async (db: any, collectionName: any, json: any) => {
  const result = await db.collection(collectionName).insertOne({ json });
  return result.insertedId;
};

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