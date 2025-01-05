export const createDynamicHtml = (data: any) => {
  // HTMLのヘッダー部分
  let html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>アンケート</title>
    </head>
    <body>
  `;
  data.forEach((question: any) => {
    html += `
    <div class="question">
    <h2>質問: ${question.question}</h2>\n`;
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
        <script src="../js/script.js"></script>
      </body>
    </html>
  `;
  return html;
};
