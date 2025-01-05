import { MongoClient } from "mongodb";

export const dbConnect = async (uri:any, dbName:any) => {
  try {
    const client = await MongoClient.connect(uri);
    console.log("MongoDBに接続しました: ", client);
    return client.db(dbName);
  } catch (error) {
    console.error("MongoDB接続エラー:", error);
    throw error;
  }
};
