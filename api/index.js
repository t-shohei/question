/**
 * /api/index.js
 */
const express = require("express");
const router = express.Router();
const path = require('path');

// JSONパース
router.use(express.json());

// /api/foo へのGETリクエスト
router.get("/foo", (req, res) => {
  // ファイルを転送
  const filePath = path.join(__dirname, "data.json"); // 安全なファイルパス結合
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("ファイル送信エラー:", err);
      res.status(400).json({ error: "ファイルを送信できませんでした" });
    } else {
      console.log("送信完了");
    }
  });
});

// /api/bar へのGET・POSTリクエスト
router
  .route("/bar")
  .get((req, res) => {
    // 受け取ったパラメータをそのままJSONにして送り返す
    res.json(req.query);
  })
  .post((req, res) => {
    // 必須のデータ項目をチェック
    const requiredFields = ["id", "name", "address"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      // 足りないフィールドをエラーメッセージにして返す
      res.status(400).json({
        error: "必要なデータが不足しています",
        missingFields: missingFields,
      });
    } else {
      res.sendStatus(200);
    }
  });

module.exports = router;
