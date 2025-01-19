import * as fs from "fs";
import * as path from "path";
export const createDynamicHtml = (data: any, questionId: any) => {
  const uploadsDir = path.join(__dirname, "../uploads/js/script.js");
  console.log(`Resolved file path: ${uploadsDir}`);
  // HTMLのヘッダー部分
  let html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>アンケート</title>
            <style>
        /* ラジオボタンを非表示 */
        input[type="radio"] {
          display: none;
        }
    
        /* カスタムラベルのスタイル */
        .custom-radio {
          display: inline-block;
          padding: 10px 20px;
          border: 2px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          text-align: center;
          margin: 5px;
        }
    
        /* 選択時のスタイル */
        input[type="radio"]:checked + .custom-radio {
          background-color: #4caf50;
          color: white;
          border-color: #4caf50;
        }
      </style>
    </head>
    <body>
      <div class="questions" id="${questionId}">
      <h1 id="question_title">${data.title}</h1>
      </div>
  `;
  data.date.forEach((question: any) => {
    html += `
      <div class="question" id="${Object.keys(question)}">
    <h2>${question[Object.keys(question).toString()]}</h2>\n
    <input type="radio" id="${question[Object.keys(question).toString()]}_circle" name="${question[Object.keys(question).toString()]}" value="〇">
    <label for="${question[Object.keys(question).toString()]}_circle" class="custom-radio">〇</label>

    <input type="radio" id="${question[Object.keys(question).toString()]}_triangle" name="${question[Object.keys(question).toString()]}" value="△">
    <label for="${question[Object.keys(question).toString()]}_triangle" class="custom-radio">△</label>

    <input type="radio" id="${question[Object.keys(question).toString()]}_x" name="${question[Object.keys(question).toString()]}" value="×">
    <label for="${question[Object.keys(question).toString()]}_x" class="custom-radio">×</label>
    `;
    if (question.type === "textarea") {
      html += `<textarea id="${question.type}_${question.question_id}"></textarea>\n`;
    } else if (question.type === "checkbox" || question.type === "radio") {
      question.questions.forEach((item: any) => {
        html += `<input name="${question.name}" id="${question.type}_${item.questions_id}" type="${question.type}" value="${item.value}">${item.value}\n`;
      });
    }
    html += `</div>`;
  });
  // HTMLのフッター部分
  html += `
        <button id="submitButton">回答</button>
        `;
  html += `<script>`;

  html += `
      const questionId = document.getElementsByClassName("questions")[0].id;
      const questionTitle = document.getElementById("question_title");
      const questionClass = document.getElementsByClassName("question");
      const submitButton = document.getElementById("submitButton");
      const resultText = document.getElementById("result");
      let textarea;
      let textareaValue;
  `;
  html +=
    `
      // JSONデータを構築
      const data = {
        questionId: questionId,
        question_title: questionTitle.textContent,
        answers: [],
      };
      submitButton.addEventListener("click", async () => {
              const name = document.getElementById("name").value;
        data.name = name
        for (let index = 0; index < questionClass.length; index++) {
          // テキストエリアの値をデータに追加する
          if (questionClass[index].querySelector("textarea") !== null) {\n` +
    "textarea = document.getElementById(`textarea_${index + 1}`);\n" +
    "textareaValue = textarea.value;\n" +
    "data.answers.push(textareaValue);\n" +
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
    "  data.answers.push(selectedCheckboxes);;\n" +
    "}\n" +
    "  //radioButtonの時のデータを追加\n" +
    "  // ラジオボタンの値をデータに追加する\n";
  html += `  else if (questionClass[index].querySelector('input[type="radio"]') !== null) {\n`;
  html +=
    `  const radios = questionClass[index].querySelectorAll('input[type="radio"]');\n` +
    "    const selectedRadio = Array.from(radios).find((radio) => radio.checked); // チェックされているラジオボタンを取得\n" +
    "data.answers.push(selectedRadio ? selectedRadio.value : null);\n" +
    "  }\n" +
    "}\n" +
    "console.log(data);\n" +
    "// JSONとして送信\n";
    html += `
      const nullValue = Object.entries(data)
    .filter(([key, value]) => value === null)
    .map(([key]) => key)
  if (nullValue) {
    nullValue.forEach((val)=>{
      console.log(val)
    })
}
    `
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
             // 配列を初期化
            data.answers = []
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
