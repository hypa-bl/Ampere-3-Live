const axios = require("axios"),
  { MessageEmbed } = require("discord.js");

module.exports = {
  description: "Find colors. Leave options empty for a random one.",
  category: "utility",

  testOnly: false,
  slash: true,

  options: [
    {
      name: "name",
      description: "search by name",
      required: false,
      type: 3,
    },
    {
      name: "hex",
      description: "search by hex, no hashtag",
      required: false,
      type: 3,
    },
  ],

  callback: async ({ interaction: i }) => {
    let apiUrl, hexValue, colName, colImg, rgbRed, rgbGreen, rgbBlue;
    let result = true;
    let ColorEmbed = new MessageEmbed().setTitle("found color");

    colName = i.options.getString("name");
    hexValue = i.options.getString("hex");

    if (!colName && !hexValue) {
      const randomColor = (
        "00000" + ((Math.random() * (1 << 24)) | 0).toString(16)
      ).slice(-6);
      apiUrl = `http://www.thecolorapi.com/id?format=json&hex=${randomColor}`;
      ColorEmbed.setTitle("Randomised result")
    }

    if (hexValue) {
      if (/^[0-9A-F]{6}$/i.test(hexValue) || /^([0-9A-F]{3}){1,2}$/i.test(hexValue)) {
        apiUrl = `http://www.thecolorapi.com/id?format=json&hex=${hexValue}`;
      } else {
        i.reply(`unable to recognize whatever ${hexValue} is`);
        result = false;
        return
      }
    }
    if (colName) {
      await axios
        .get(`https://api.color.pizza/v1/names/${colName}`)
        .then((res) => {
          if (!res.data.colors.length) {
            i.reply(`no results for ${colName}!`);
            result = false;
            return
          }
          
          hexValue = res.data.colors[0].hex;
          ColorEmbed = new MessageEmbed()
            .setTitle((res.data.colors.length === 1) ? `1 result` : `${res.data.colors.length} results for ${colName}, max 20 shown`)
            .setColor(hexValue)
            .setImage(`https://singlecolorimage.com/get/${hexValue.slice(1)}/400x100`)
            
          for (let i=0; i<=20; i++) {
            if (res.data.colors.length === i) {
              break;
            }
            
            ColorEmbed.addFields({
              name: res.data.colors[i].name,
              value: `hex: ${res.data.colors[i].hex}\nRGB(${res.data.colors[i].rgb.r}, ${res.data.colors[i].rgb.g}, ${res.data.colors[i].rgb.b})`,
              inline: true,
            });
          }
        })
        .catch((err) => {
          console.error("ERR: ", err);
        });
    }

    // api url is available when random or hex search is done
    if (apiUrl) {
      await axios
        .get(apiUrl)
        .then((res) => {
          colName = res.data.name.value;
          hexValue = res.data.hex.value;

          rgbRed = res.data.rgb.r;
          rgbGreen = res.data.rgb.g;
          rgbBlue = res.data.rgb.b;
        })
        .catch((err) => {
          console.error("Error: ", err);
        });

      ColorEmbed = new MessageEmbed(ColorEmbed)
        .setDescription(colName)
        .setColor(hexValue)
        .addField(
          "Additional info",
          `Hex: ${hexValue}\nRGB(${rgbRed}, ${rgbGreen}, ${rgbBlue})`
        )
        .setImage(`https://singlecolorimage.com/get/${hexValue.slice(1)}/400x100`);
    }

    if (result) {
      i.reply({
        embeds: [ColorEmbed],
      });
    }
  },
};
