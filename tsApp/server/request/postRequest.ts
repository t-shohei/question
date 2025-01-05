import { createDynamicHtml } from "../../util/htmlGenerator";
import { IncomingForm } from "formidable";
import * as fs from "fs";
import * as path from "path";

export let fileNum = 1;
// アンケートHTMLファイル置き場の作成
const questionsDir = path.join(__dirname, "../../uploads/questions");
if (!fs.existsSync(questionsDir)) fs.mkdirSync(questionsDir);
// POST処理
export const postRequest = (req: any, res: any, db: any) => {
  // ファイルが送信されてきたとき
  if (req.url === "/upload") {
    // アンケートのアップロード処理
    const form = new IncomingForm();
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

      fs.readFile(uploadedFile.filepath, "utf-8", (readErr, data) => {
        if (readErr) {
          res.statusCode = 500;
          res.end("ファイル読み込みエラー");
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          // HTMLファイルを保存し、連番を加算
          const questionHtmlFile = `question${fileNum}.html`;
          fileNum++;
          // アンケートHTMLのファイルのパスを作成
          const htmlFilePath = path.join(questionsDir, questionHtmlFile);
          fs.writeFile(htmlFilePath, createDynamicHtml(jsonData), (err) => {
            if (err) {
              res.statusCode = 500;
              res.end("ファイル作成エラー");
              return;
            }
          });
          console.log("アップロードされたデータ:", jsonData);
          const result = registQuestion(db,"questions",jsonData)
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
  } else if (req.url === "/submit") {
    // アンケート回答の送信処理
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const answerData = JSON.parse(body);
        const answersCollection = db.collection("answers");
        answersCollection.insertOne(
          answerData,
          (err: Error | null, result: any) => {
            if (err) {
              res.statusCode = 500;
              res.end("データ保存エラー");
              return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                message: "回答が保存されました",
                id: result.insertedId,
              })
            );
          }
        );
      } catch (parseErr) {
        res.statusCode = 400;
        res.end("無効なデータ形式です");
      }
    });
  } else {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain");
    res.end("Method Not Allowed");
  }
};
const registQuestion = async (db: any, collectionName: any, json: any) =>{
  const result = await db.collection(collectionName).insertOne({json});
  return result
}