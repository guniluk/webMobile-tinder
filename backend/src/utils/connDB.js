import mongoose from "mongoose";
import User from "../models/user.model.js";

export const connDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected: ", conn.connection.host);

    // 레거시 인덱스(예: username_1)를 현재 스키마와 동기화하여 자동 정리
    try {
      await User.syncIndexes();
      console.log("User indexes synchronized successfully.");
    } catch (indexError) {
      // 만약 syncIndexes 과정에서 이슈가 발생할 경우 username_1 직접 drop 시도
      try {
        await User.collection.dropIndex("username_1");
        console.log("Legacy username_1 index dropped successfully.");
      } catch {
        // 이미 없거나 무시 가능
      }
    }
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};
