const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const citizenSchema = new Schema({
  username: { type: String },
  fullname: { type: String },
  password: { type: String },
  status: { type: String, enum: ['OK', 'Help', 'Emergency', 'Undefined'], default: 'Undefined' },
});
const Citizen = mongoose.model("Citizen", citizenSchema);
module.exports = { Citizen };
