const mongoose = require("mongoose");

// Reuse connection across serverless invocations
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

connectDB().catch((err) => console.error("MongoDB error:", err));

const urlSchema = new mongoose.Schema({
  ourl: { type: String, required: true },
  surl: { type: String, required: true },
});

module.exports = mongoose.model("Url", urlSchema);
