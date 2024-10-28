const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const citizenSchema = new Schema({
  username: { type: String },
  fullname: { type: String },
  password: { type: String },
  privilege: {
    type: String,
    enum: ['Administrator', 'Coordinator', 'Citizen'],
    default: 'Citizen'
  },
  status: {
    type: String,
    enum: ['OK', 'Active', 'Inactive'],
    default: 'Active'
  }
});
const Citizen = mongoose.model("Citizen", citizenSchema);
module.exports = { Citizen };
