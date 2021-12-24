const playerSchema = require("./schemas/playerSchema");

async function addMoney(amount, userId, whereTo) {
  let pocketAmount = 0;
  let bankAmount = 0;

  if (/(balance)|(pocket)/i.test(whereTo)) {
    pocketAmount = amount;
  }

  if (/bank/i.test(whereTo)) {
    bankAmount = amount;
  }

  await playerSchema
    .findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: {
          "economy.balance": pocketAmount,
          "economy.bank": bankAmount,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )
    .clone();
}

async function reduceMoney(amount, userId, whereTo) {
  await addMoney(parseInt(`-${amount}`), userId, whereTo);
}

module.exports = { addMoney, reduceMoney };