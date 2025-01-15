import * as http from "http";
import * as fs from "fs";
import * as path from "path";
const indexPath = path.join(__dirname, "../../public/index.html");
const createPath = path.join(
  __dirname,
  "../../makeQuestion/createQuestion.html"
);

// GET処理
export const getRequest = async (
  req: http.IncomingMessage,
  res: any,
  db: any
) => {
  // Topページの表示
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
  else if (req.url?.startsWith("/uploads/questions/")) {
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
    console.log("結果取得開始");

    const answersCollection = db.collection("answers");
    const result = await answersCollection.find().toArray();
    console.log(result);

    // if (err) {
    //   res.statusCode = 500;
    //   res.end("データ取得エラー");
    //   return;
    // }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  }

  // アンケート作成ページに遷移する用
  else if (req.url === "/create") {
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
  }
  // その他のGETリクエスト
  else {
    res.statusCode = 404;
    res.end("Not Found");
  }
};
