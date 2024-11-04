import * as http from "http";
import * as fs from "fs";
import * as path from "path";

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      const filePath: string = path.join(__dirname, "/public", req.url === "/" ? "index.html": req.url!);
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end("Error");
          return;
        }
        res.end(data);
      });
    }
    else if (req.method === "POST" && req.url === "/upload") {
      let body: string = "";
      if (req.headers['content-type'] !== 'application/json') {
        console.log(req.headers["content-type"]);
        res.statusCode = 400;
        res.end("Content-Typeはapplication/jsonである必要があります");
        return;
      }
      req.on("data", (chunk: string) => {
        body += chunk;
      });

      req.on("end", () => {
        console.log(body);
        try {
          const jsonData = JSON.parse(body); // JSONパース
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "データを受け取りました",
              data: jsonData,
            })
          );
        } catch (err) {
          console.error(err);
          res.statusCode = 400;
          res.end("無効なJSONデータです");
        }
      });
    } else {
      res.statusCode = 405;
      res.setHeader("Content-Type", "text/plain");
      res.end("Method Not Allowed");
    }
  }
);

server.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});
MockKでcoEveryを使ってシールドインターフェース（sealed interface）をモックしようとした場合、initializationErrorが出ることがあります。Kotlinのシールドインターフェースはコンパイル時に決まったサブクラスを持つように設計されていますが、MockKで直接モックしようとするとエラーが発生する場合があります。これは、MockKがsealedインターフェースやクラスをうまく処理できないためです。

以下の解決策を試してみてください。

解決策1: sealed interfaceの具体的なインスタンスを返す
Result() ではなく、Resultの具体的なサブクラスのインスタンス（SuccessまたはFailure）を返すようにします。

kotlin
コードをコピーする
@Test
fun testFunction() {
    coEvery { 関数() } returns Success() // Success()やFailure()などの具体的なインスタンス
}
解決策2: mockk関数で直接モックインスタンスを返す
SuccessやFailureのような具体的なサブクラスが存在する場合、それらをmockkで作成し、coEveryで返すことも可能です。

kotlin
コードをコピーする
val mockSuccess = mockk<Success>()
coEvery { 関数() } returns mockSuccess
解決策3: 型の柔軟性を確認
場合によっては、関数の戻り型を変更できるなら、sealed interfaceの代わりに柔軟な型に変更してモックを適用することも可能です。

MockKのシールドインターフェース対応には限界があるため、上記の方法で特定の実装を返すことでエラーが解決することが多いです。






