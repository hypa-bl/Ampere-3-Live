module.exports = {
  patterns: /^(\bay+)$/i,
  execute (message) {
    
    const finalAyy = (message.content.slice(-1) === message.content.slice(-1).toUpperCase()) ?
      `${message.content}Y` : 
      `${message.content}y`;
    
    message.channel.send(finalAyy)
  }
}