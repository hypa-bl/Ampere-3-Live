const snipes = {};

function snipe (channelId, author, content, image) {
  snipes[channelId] = {
    author: author,
    content: content,
    image: image
  }
  
  setTimeout(() => {
    delete snipes[channelId]
  }, 30000 /* 1k ms for 1 s */);
}

module.exports = { snipe, snipes }