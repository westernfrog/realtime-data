import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://westernfrog:Pottyboy%407483@users.r7xott4.mongodb.net/realtime`
    );
    console.log("Connected");
  } catch (error) {
    console.error(`Failed to connect to database: ${error}`);
    throw new Error("Database connection failed");
  }
};

export default connectToDatabase;
