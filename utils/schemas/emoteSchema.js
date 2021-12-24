const mongoose = require("mongoose");

const emoteSchema = mongoose.Schema({
  _id: { 
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  animated: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model("add-emotes-mongo", emoteSchema);