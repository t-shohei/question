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
exports.createDynamicHtml = void 0;
const path = __importStar(require("path"));
const createDynamicHtml = (data, questionId) => {
    const uploadsDir = path.join(__dirname, "../uploads/js/script.js");
    console.log(`Resolved file path: ${uploadsDir}`);
    // HTMLのヘッダー部分
    let html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>アンケート</title>
    </head>
    <body>
      <div class="questions" id="${questionId}">
  `;
    data.forEach((question) => {
        html += `
      <div class="question" id="${question.question_id}">
    <h2>質問: ${question.question_id}</h2>\n`;
        if (question.type === "textarea") {
            html += `<textarea id="${question.type}_${question.question_id}"></textarea>\n`;
        }
        else if (question.type === "checkbox" || question.type === "radio") {
            question.questions.forEach((item) => {
                html += `<input name="${question.name}" id="${question.type}_${item.questions_id}" type="${question.type}" value="${item.value}">${item.value}\n`;
            });
        }
        html += `</div>`;
    });
    // HTMLのフッター部分
    html += `
        <button id="submitButton">回答</button>
        </div>`;
    html += `<script>`;
    html += `
      const questionId = document.getElementsByClassName("questions")[0].id;
      const questionClass = document.getElementsByClassName("question");
      const submitButton = document.getElementById("submitButton");
      const resultText = document.getElementById("result");
      let textarea;
      let textareaValue;
  `;
    html +=
        `
// JSONデータを構築
      const data = {questionId: questionId,};
      submitButton.addEventListener("click", async () => {
        for (
          let index = 0, answerId = 1;
          index < questionClass.length;
          index++, answerId++
        ) {
          // テキストエリアの値をデータに追加する
          if (questionClass[index].querySelector("textarea") !== null) {\n` +
            "textarea = document.getElementById(`textarea_${index + 1}`);\n" +
            "textareaValue = textarea.value;\n" +
            "data[`textarea_${answerId}`] = textareaValue;\n" +
            "}" +
            "// checkboxの時にデータを追加する\n";
    html +=
        `else if (questionClass[index].querySelector('input[type="checkbox"]') !==null) {\n` +
            "  checkboxes = questionClass[index].querySelectorAll(\n";
    html +=
        `    'input[type="checkbox"]'\n` +
            "  );\n" +
            "  selectedCheckboxes = Array.from(checkboxes)\n" +
            "    .filter((checkbox) => checkbox.checked) // チェックされているものだけに絞る\n" +
            "    .map((checkbox) => checkbox.value); // 値を取得\n" +
            "  data[`checkbox_${answerId}`] = selectedCheckboxes;\n" +
            "}\n" +
            "  //radioButtonの時のデータを追加\n" +
            "  // ラジオボタンの値をデータに追加する\n";
    html += `  else if (questionClass[index].querySelector('input[type="radio"]') !== null) {\n`;
    html +=
        `  const radios = questionClass[index].querySelectorAll('input[type="radio"]');\n` +
            "    const selectedRadio = Array.from(radios).find((radio) => radio.checked); // チェックされているラジオボタンを取得\n" +
            "    data[`radio_${answerId}`] = selectedRadio ? selectedRadio.value : null; // チェックされていない場合は null\n" +
            "  }\n" +
            "}\n" +
            "console.log(data);\n" +
            "// JSONとして送信\n";
    html += `try {
          console.log("client inTry");
          await fetch("/answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // JSONを送信する場合のヘッダー
            },
            body: JSON.stringify(data), // JSON形式に変換して送信
          })
            .then((response) => response.json())
            .then((res) => {
              console.log(res.message);
              resultText.textContent = res.message;
            })
            .catch((err) => console.log(err));
          console.log("client endTry");
        } catch (error) {
          console.error(error);
        }
      }
    );`;
    html += `
      </script>
      </body>
    </html>
  `;
    return html;
};
exports.createDynamicHtml = createDynamicHtml;
