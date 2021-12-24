const mongoose = require("mongoose");
const reqString = {
  type: String,
  required: true
};
const reqNum = {
  type: Number,
  required: true
}

const playerSchema = mongoose.Schema({
  _id: reqString,
  servers: [String],
  passive: {
    type: Boolean,
    default: false
  },
  economy: {
    balance: reqNum,
    bank: reqNum,
    multiplier: {
      type: Number,
      default: 1,
      required: true
    },
    dailyReset: {
      type: Date,
      required: true
    }
  }, 
  inventory: [{
    name: reqString,
    aliases: [String],
    use: reqString,
    description: reqString,
    emoji: String,
    quantity: reqNum,
    category: reqString,
    sellPrice: Number,
    buyPrice: Number,
    tier: reqNum,
    damage: String,
    recipes: [String]
  }]
}, { minimize: false, strict: false })

module.exports = mongoose.model("player-info-mongo", playerSchema);