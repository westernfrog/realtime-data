import mongoose from "mongoose";

const RealtimeSchema = new mongoose.Schema(
  {
    throughput: {
      type: Number,
      require: true,
    },
    rssi: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

const RealtimeModel =
  mongoose.models.Realtime || mongoose.model("Realtime", RealtimeSchema);

export async function getData() {
  return RealtimeModel.find().sort("-createdAt").lean().exec();
}

export async function createData(data) {
  const newData = new RealtimeModel({
    throughput: data.throughput,
    rssi: data.rssi,
  });

  console.log(newData);

  await newData.save();
  return newData.toObject();
}

export default RealtimeModel;
