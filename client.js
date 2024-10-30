const net = require('net');
const readline = require('readline');

// サーバーに接続
const client = net.createConnection({ port: 3000 }, () => {
  console.log('サーバーに接続されました');

  // ユーザー入力を取得するためのインターフェースを作成
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // ユーザーに文字入力を求める
  rl.question('1文字のアルファベットを入力してください: ', (input) => {
    client.write(input);
    rl.close();
  });
});

// サーバーからのデータを受け取る
client.on('data', (data) => {
  console.log(data.toString());

  // 通信終了
  client.end();
});

// 接続が終了した時
client.on('end', () => {
  console.log('接続が終了しました');
});
