const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

// surveysとuploadsフォルダの存在確認
const surveysDir = path.join(__dirname, "surveys");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(surveysDir)) fs.mkdirSync(surveysDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// JSONファイルのアップロードエンドポイント
app.post("/upload", upload.single("jsonFile"), (req, res) => {
  const jsonFilePath = req.file.path;
  let jsonData;

  try {
    jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  } catch (err) {
    console.error("JSONファイルの読み込みエラー:", err);
    return res.status(400).json({ error: "無効なJSONファイルです" });
  }

  // アンケートHTML生成
  const surveyId = Date.now().toString();
  const surveyPath = path.join(__dirname, "surveys", `${surveyId}.html`);

  app.render("surveyTemplate", { data: jsonData }, (err, html) => {
    if (err) {
      console.error("テンプレートのレンダリング中にエラー:", err);
      return res.status(500).json({ error: "アンケート生成エラー" });
    }

    fs.writeFile(surveyPath, html, (err) => {
      if (err) {
        console.error("アンケートファイルの保存中にエラー:", err);
        return res.status(500).json({ error: "アンケート生成エラー" });
      }

      // アップロードしたJSONファイルを削除
      fs.unlink(jsonFilePath, (err) => {
        if (err) console.error("一時ファイルの削除に失敗しました:", err);
      });

      res.json({ url: `/surveys/${surveyId}.html` });
    });
  });
});

// 動的に生成されたアンケートファイルを提供
app.use("/surveys", express.static(surveysDir));

app.listen(3030, () => console.log("Server running on port 3030"));
