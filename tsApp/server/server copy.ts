import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import { IncomingForm } from "formidable";
import { createDynamicHtml } from "../util/htmlGenerator";
import { connect, Schema, model, Document } from "mongoose";

// MongoDB 接続情報
const dbName = "questionAnswer";
const uri = `mongodb://questionAnswer:89248924@localhost:27017/${dbName}`;

// Mongoose スキーマ定義

// Question用インターフェース
interface IQuestion {
  json: object;
}

// Mongooseの Document と IQuestion を合体させた型
interface QuestionDocument extends IQuestion, Document {}

// Answer用インターフェース
interface IAnswer extends Document{
  questionId: String;
  question_title: String;
  answers: object[];
}

// Mongooseの Document と IAnswer を合体させた型
interface AnswerDocument extends IAnswer, Document {}

// スキーマ定義
const questionSchema = new Schema<IQuestion>({
  json: { type: Object, required: true },
});

const answerSchema = new Schema<IAnswer>({
  questionId: { type: String, required: true },
  question_title: { type: String, required: true },
  answers: { type: [Object], required: true },
});

// モデル作成
const Question = model<QuestionDocument>("Question", questionSchema);
const Answer = model<AnswerDocument>("Answer", answerSchema);

// Express サーバー設定

const app = express();
const port = 8000;

// 静的ファイル格納用ディレクトリ
let fileNum = 1;
const indexPath = path.join(__dirname, "../public/index.html");
const createPath = path.join(__dirname, "../makeQuestion/createQuestion.html");
const questionsDir = path.join(__dirname, "../uploads/questions");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// MongoDB 接続
connect(uri)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Connection error:", err));

// 画面遷移系

// トップページ
app.get("/", (req: Request, res: Response) => {
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.status(500).send("ファイルが見つかりません");
      return;
    }
    res.status(200).setHeader("Content-Type", "text/html").end(data);
  });
});

// 質問作成ページ
app.get("/create", (req: Request, res: Response) => {
  fs.readFile(createPath, (err, data) => {
    if (err) {
      res.status(500).send("ファイルが見つかりません");
      return;
    }
    res.status(200).setHeader("Content-Type", "text/html").end(data);
  });
});

// アップロード済みのHTMLを表示する（問題表示用）
app.get("/uploads/questions/*", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../", req.url);
  fs.access(filePath, fs.constants.F_OK, (accessErr) => {
    if (accessErr) {
      res.status(404)
        .setHeader("Content-Type", "text/plain")
        .send("指定されたファイルが見つかりません。");
      return;
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res
          .status(500)
          .setHeader("Content-Type", "text/plain")
          .send("ファイルの読み込み中にエラーが発生しました。");
        return;
      }
      res.status(200).setHeader("Content-Type", "text/html").end(data);
    });
  });
});

// 処理系

// 結果取得API
app.get("/results", async (req: Request, res: Response) => {
  console.log("結果取得開始");

  try {
    // 例として question_title が "飲みかい日程" の回答を検索
    const answersResult = await Answer.find({ question_title: "飲みかい日程" }).exec();

    // 該当する回答の先頭要素の questionId で Questionを検索
    const questionId = answersResult[0]?.questionId;
    if (!questionId) {
      res.status(404).send("対象の問題が見つかりません");
      return;
    }

    const questionResult = await Question.find({ _id: questionId }).exec();

    console.log("questionResult:", questionResult);
    console.log("answersResult:", answersResult);

    res.status(200).json({
      ans: answersResult,
      question: questionResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("結果取得エラー");
  }
});

// 型定義：Formidable周り

// formidable の parse 結果を簡易的に型定義
interface FormidableFields {
  [key: string]: any;
}

interface FormidableFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
}

// JSONアップロードAPI

app.post("/upload", (req: Request, res: Response) => {
  const form = new IncomingForm();

  form.parse(req, async (err: Error | null, fields: FormidableFields, files: any) => {
    if (err) {
      res.status(500).send("フォーム解析エラー");
      return;
    }

    // JSONファイルを取り出す（複数の場合は先頭を使用）
    const uploadedFile: FormidableFile | undefined = Array.isArray(files.jsonFile)
      ? files.jsonFile[0]
      : files.jsonFile;

    if (!uploadedFile) {
      res.status(400).send("JSONファイルが見つかりません");
      return;
    }

    fs.readFile(uploadedFile.filepath, "utf-8", async (readErr, data) => {
      if (readErr) {
        res.status(500).send("ファイル読み込みエラー");
        return;
      }

      try {
        const jsonData = JSON.parse(data);

        // 質問ドキュメントをDBに保存
        const questionDoc = new Question({ json: jsonData });
        const savedQuestion = await questionDoc.save();

        // HTMLファイルを保存し、連番を加算
        const questionHtmlFile = `question${fileNum}.html`;
        fileNum++;

        const htmlFilePath = path.join(questionsDir, questionHtmlFile);
        fs.writeFile(
          htmlFilePath,
          createDynamicHtml(jsonData, savedQuestion._id),
          (writeErr) => {
            if (writeErr) {
              res.status(500).send("ファイル作成エラー");
              return;
            }
            // 書き込み成功後にURLを返す
            res.status(200).json({
              message: "データを受け取りました",
              data: jsonData,
              url: `http://localhost:${port}/uploads/questions/${questionHtmlFile}`,
            });
          }
        );
      } catch (parseErr) {
        res.status(400).send("無効なJSONデータです");
      }
    });
  });
});

// 型定義：回答API用 Request Body

interface AnswerRequestBody {
  questionId: string;
  question_title: string;
  answers: object[];
}

// 回答送信
app.post(
  "/answer",
  (req: Request<{}, any, AnswerRequestBody>, res: Response) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        console.log("inTry");
        const answerData: AnswerRequestBody = JSON.parse(body);

        const answer = new Answer(answerData);
        const result = await answer.save();

        res.status(200).json({
          message: "回答が保存されました",
          id: result._id,
        });
        console.log("tryEnd:", result);
      } catch (error) {
        console.error(error);
        res.status(500).send("データ保存エラー");
      }
    });
  }
);

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
