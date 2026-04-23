require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const model = require("./model/user");
const app = express();
const val = require("valid-url");
const short = require("shortid");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected before handling requests
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Debug route - remove after fixing
app.get("/debug", (req, res) => {
  res.json({
    mongoUri: process.env.MONGODB_URI ? "SET ✓" : "NOT SET ✗",
    nodeEnv: process.env.NODE_ENV || "not set",
  });
});

// Home - show form
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.render("form");
  } catch (err) {
    res.status(500).send("DB connection failed: " + err.message);
  }
});

// Submit - validate, shorten, store
app.post("/submit", async (req, res) => {
  try {
    await connectDB();
    const url = req.body.url;

    if (!val.isUri(url)) {
      return res.send("Please enter a valid URL");
    }

    const gene = short.generate();
    await model.insertMany({ ourl: url, surl: gene });
    console.log(`Shortened: ${url} → ${gene}`);

    res.render("final", { url, gene });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Redirect short URL to original
app.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const ori = await model.findOne({ surl: req.params.id });
    if (!ori) return res.status(404).send("Short URL not found");
    res.redirect(ori.ourl);
  } catch (err) {
    res.status(500).send("Something went wrong: " + err.message);
  }
});

// Export for Vercel (serverless), also listen locally
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Server running at http://localhost:3000"));
}

module.exports = app;
