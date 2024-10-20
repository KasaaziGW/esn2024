const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },  // The citizen who created the announcement
  createdDate: { type: Date, default: Date.now }  // Auto-populate the creation date
});

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = { Announcement };
