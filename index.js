require("dotenv").config();
const express = require("express");
const mongo = require("mongoose");
const model = require("./model/user");
const app = express();
const val = require("valid-url");
const short = require("shortid");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Home - show form
app.get("/", (req, res) => {
  res.render("form");
});

// Submit - validate, shorten, store
app.post("/submit", async (req, res) => {
  const name = req.body.name;
  const url = req.body.url;

  if (!val.isUri(url)) {
    return res.send("Please enter a valid URL");
  }

  const gene = short.generate();
  const ourl = url;
  const surl = gene;

  await model.insertMany({ ourl, surl });
  console.log(`Shortened: ${url} → ${gene}`);

  res.render("final", { url, gene });
});

// Redirect short URL to original
app.get("/:id", async (req, res) => {
  try {
    const ori = await model.findOne({ surl: req.params.id });
    if (!ori) return res.status(404).send("Short URL not found");
    res.redirect(ori.ourl);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
