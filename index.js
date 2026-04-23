require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const model = require("./model/user");
const app = express();
const val = require("valid-url");
const short = require("shortid");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Cached connection for serverless
let conn = null;
async function connectDB() {
  if (conn && mongoose.connection.readyState === 1) return;
  conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
}

// Debug route
app.get("/debug", (req, res) => {
  res.json({
    mongoUri: process.env.MONGODB_URI ? "SET ✓" : "NOT SET ✗",
    nodeEnv: process.env.NODE_ENV || "not set",
    mongoState: mongoose.connection.readyState,
  });
});

// Home - show form
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.render("form");
  } catch (err) {
    console.error("GET / error:", err.message);
    res.status(500).send("Error: " + err.message);
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
    await model.create({ ourl: url, surl: gene });
    console.log(`Shortened: ${url} → ${gene}`);

    res.render("final", { url, gene });
  } catch (err) {
    console.error("POST /submit error:", err.message);
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
    console.error("GET /:id error:", err.message);
    res.status(500).send("Something went wrong: " + err.message);
  }
});

module.exports = app;
