const http = require("http");
const fs = require("fs");
const path = require("path");

// surveysとuploadsディレクトリの存在を確認
const surveysDir = path.join(__dirname, "surveys");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(surveysDir)) fs.mkdirSync(surveysDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    // ファイルのアップロード処理
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();

        // ファイルデータの解析
        const boundary = req.headers["content-type"]
          .split("; ")[1]
          .replace("boundary=", "");
        const parts = body.split(`--${boundary}`);
        const filePart = parts.find((part) => part.includes("filename="));
        const fileData = filePart.split("\r\n\r\n")[1].split("\r\n--")[0];

        // JSONデータとして解釈
        const jsonFilePath = path.join(uploadsDir, `upload_${Date.now()}.json`);
        fs.writeFileSync(jsonFilePath, fileData);

        try {
          const jsonData = JSON.parse(fileData);

          // アンケートHTML生成
          const surveyId = Date.now().toString();
          const surveyPath = path.join(surveysDir, `${surveyId}.html`);
          const htmlContent = generateSurveyHtml(jsonData);

          // HTMLファイルに書き込む
          fs.writeFileSync(surveyPath, htmlContent);

          // JSONファイル削除
          fs.unlink(jsonFilePath, (err) => {
            if (err) console.error("一時ファイルの削除に失敗しました:", err);
          });

          // レスポンスとしてURLを返す
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ url: `/surveys/${surveyId}.html` }));
        } catch (err) {
          console.error("JSONファイルの読み込みエラー:", err);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "無効なJSONファイルです" }));
        }
      });
  } else if (req.method === "GET" && req.url.startsWith("/surveys/")) {
    // 生成されたアンケートHTMLを提供
    const surveyPath = path.join(__dirname, req.url);
    fs.readFile(surveyPath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("ファイルが見つかりません");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else {
    // その他のエンドポイントに対するレスポンス
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("エンドポイントが見つかりません");
  }
});

// アンケートHTML生成関数
function generateSurveyHtml(data) {
  let html = `<!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>アンケート</title>
  </head>
  <body>
    <h1>アンケート</h1>
    <form>`;

  data.forEach((question, index) => {
    html += `<div><h2>設問 ${index + 1}: ${question.name}</h2>`;
    if (question.type === "textarea") {
      html += `<textarea rows="4" cols="50">${question.value || ""}</textarea>`;
    } else if (
      question.type === "checkbox" &&
      Array.isArray(question.questions)
    ) {
      question.questions.forEach((option) => {
        html += `<label><input type="checkbox" ${
          option.checked ? "checked" : ""
        }> ${option.value}</label><br />`;
      });
    }
    html += `</div>`;
  });

  html += `</form></body></html>`;
  return html;
}

server.listen(3031, () => {
  console.log("Server running on port 3030");
});
