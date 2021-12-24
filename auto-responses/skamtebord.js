module.exports = {
  patterns: /skateboard|sk8|\bboard\b|skamtebord/i,
  execute (message) {
    message.channel.send("skamtebord");
  }
}