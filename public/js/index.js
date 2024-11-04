const uploadFile = async () => {
  const formData = new FormData(document.getElementById("uploadForm"));
  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // エラー時はJSONではなくテキストでレスポンスを取得
      const errorText = await response.text();
      console.error("Error:", errorText);
      document.getElementById("response").textContent =
        "エラーが発生しました: " + errorText;
      return;
    }

    // 成功時のJSONレスポンス
    const result = await response.json();
    document.getElementById("response").textContent = result.url
      ? `アンケートが作成されました: ${result.url}`
      : "エラーが発生しました。";
  } catch (err) {
    console.error("Fetchエラー:", err);
    document.getElementById("response").textContent =
      "通信エラーが発生しました。";
  }
};

const uploadButton = document.getElementById("uploadButton");
if (uploadButton) {
  uploadButton.addEventListener("click", uploadFile);
} else {
  console.error("アップロードボタンが見つかりません。");
}
