const cooldown_global = new Set();

function addToCooldown(userID, milliseconds, globalOrNo, localCooldownSet) {

  let cooldowns_set = (globalOrNo) ? cooldown_global : localCooldownSet
  let timeout = (globalOrNo) ? 5000 : milliseconds
  cooldowns_set.add(userID);

  setTimeout(() => {
    cooldowns_set.delete(userID);
  }, timeout /* 1k ms for 1 s */);
}

module.exports = { addToCooldown, cooldown_global };