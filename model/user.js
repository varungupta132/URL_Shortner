const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  ourl: { type: String, required: true },
  surl: { type: String, required: true },
});

module.exports = mongoose.model("Url", urlSchema);
