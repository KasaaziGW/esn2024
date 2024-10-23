
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: String },
  message: { type: String },
  sentTime: { type: String },
  delivered: { type: Boolean, default: false },  // Track delivery status
  forwardCount: { type: Number, default: 0 },    // Track how many times the message has been forwarded
});

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
