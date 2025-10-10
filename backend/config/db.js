import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect('mongodb+srv://krishnasharma102938:kaushik1029@cluster0.mgaicgd.mongodb.net/')
        .then (() => console.log('DB connected'));
}