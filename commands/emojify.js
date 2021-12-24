const 
  emojiSet = require("emoji-set"),
  { Roll } = require("../utils/roll")

module.exports = {
  description: "Add emojis after every word. Yes.",
  category: "fun",
  
  slash: true,
  testOnly: false,

  options: [{
    name: "text",
    description: "there's a limit so don't drop one that's too big",
    required: true,
    type: 3
  }],

  callback: async ({ interaction: i }) => {
    const textString = i.options.getString("text");

    await i.deferReply()
    const textArray = textString.split(" ");

    let arrayWithAllEmojis = emojiSet.getAll(true)

    let finalArray = [];

    textArray.forEach(word => {
      let wordMatched = emojiSet.searchByKeyword(word, false, true);
      
      let wordEmojified = (wordMatched) ? 
        `${word} ${wordMatched[Roll(0, wordMatched.length)]}` :
        `${word} ${arrayWithAllEmojis[Roll(0, arrayWithAllEmojis.length)]}`

      finalArray.push(wordEmojified)
    })

    let finalString = finalArray.join(" ");
    console.log(`had to calculate a ${finalString.length} chars long pasta`)
    
    if (finalString.length >= 2000) {
      i.editReply({
        content: `${finalString.substring(0, 1940)}\n \`\`\` had to stop midway thanks to the word limit \`\`\``
      })
    }
    else {
      i.editReply({
        content: finalString
      })
    }
  }
}