import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://organizr1029_db_user:organizr1029@cluster0.ryvvf8x.mongodb.net/"
  );
  console.log("DB connected");
};
