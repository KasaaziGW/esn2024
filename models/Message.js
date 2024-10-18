const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: String },
  message: { type: String },
  sentTime: { type: String },
  // To retain the delivery status (two ticks) after reloading or logging in again, I had to save that status as part of the message model in your database. 
  // I have added a delivered field to the message schema to track if a message has been delivered.
  delivered: { type: Boolean, default: false },  // Add this field to track delivery status
});

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
