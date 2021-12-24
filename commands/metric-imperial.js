const { MessageEmbed } = require("discord.js"),
  { colors } = require("../config.json");

module.exports = {
  description: "convert to and from metric and imperial units",
  category: "utility",

  slash: true,
  testOnly: false,

  options: [
    {
      name: "converting_from",
      description: "metric/imperial",
      required: true,
      type: 3,
    },
    {
      name: "metres-feet",
      description: "bigboi values",
      required: false,
      type: 4,
    },
    {
      name: "centimetres-inches",
      description: "smolboi values",
      required: false,
      type: 4,
    },
  ],

  callback: ({ interaction: i }) => {
    let fromWhere;

    switch (i.options.getString("converting_from")) {
      case "metric":
      case "metres":
      case "meters":
      case "metre":
      case "meter":
      case "cm":
      case "m":
        fromWhere = "m / cm";
        break;
      case "imperial":
      case "feet":
      case "inches":
      case "inch":
        fromWhere = "feet / inch";
        break;
      default:
        fromWhere = null;
        break;
    }
    const mainValue = i.options.getInteger("metres-feet"),
      subValue = i.options.getInteger("centimetres-inches"),
      defaultEmbed = new MessageEmbed()
        .setTitle(`Converted from ${fromWhere}`)
        .setColor(colors.accent);

    if (!fromWhere) {
      i.reply({
        content: "properly specify what to convert from!",
        ephemeral: true,
      });
      return;
    }

    if (!mainValue && !subValue) {
      i.reply({
        content: "give me some proper numbers jeez!",
        ephemeral: true,
      });
      return;
    }

    let initialValue;
    let finalValue;

    if (fromWhere === "m / cm") {
      let cm_inch = 0;
      let cm_feet = 0;
      let m_inch = 0;
      let m_feet = 0;

      let total_inches = 0;
      let total_feet = 0;

      if (mainValue) {
        // m to inches
        m_inch = (mainValue * 39.370079).toFixed(5);
      }
      if (subValue) {
        // cm to inches
        cm_inch = (subValue * 0.39370079).toFixed(5);
      }

      if (mainValue && subValue) {
        // if both m and cm were given
        initialValue = `${mainValue}m ${subValue}cm`;
      }
      if (mainValue && !subValue) {
        // if only metres are specified
        initialValue = `${mainValue} metres`;
      }
      if (!mainValue && subValue) {
        // if only cms are given
        initialValue = `${subValue} centimetres`;
      }

      total_inches = parseFloat(m_inch) + parseFloat(cm_inch);
      total_feet = Math.floor(total_inches / 12);
      total_inches %= 12;

      finalValue = `${total_feet}'${total_inches.toFixed(3)}"`;
    }

    if (fromWhere === "feet / inch") {
      let inch_cm = 0;
      let inch_m = 0;
      let feet_cm = 0;
      let feet_m = 0;

      let total_cms = 0;
      let total_metres = 0;

      if (mainValue) {
        // feet to cm and m
        feet_cm = (mainValue * 30.48).toFixed(5);
        feet_m = (mainValue * 0.3048).toFixed(5);
      }
      if (subValue) {
        // inches to cm
        inch_cm = (subValue * 2.54).toFixed(5);
      }

      if (mainValue && subValue) {
        // if both feet and inch were given
        initialValue = `${mainValue}'${subValue}"`;
      }
      if (mainValue && !subValue) {
        // if only feet are specified
        initialValue =
          mainValue > 1 ? `${mainValue} feet` : `${mainValue} foot`;
      }
      if (!mainValue && subValue) {
        // if only inches are given
        initialValue = `${subValue} inches`;
      }

      total_cms = parseFloat(feet_cm) + parseFloat(inch_cm);
      finalValue =
        total_cms >= 100
          ? `${Math.trunc(total_cms / 100)}m ${Math.round(total_cms).toString().slice(-2)}cm`
          : `${total_cms}cm`;
    }

    const finalEmbed = new MessageEmbed(defaultEmbed).setDescription(
      `that'll be about **${finalValue}** from the given value **${initialValue}**`
    );

    i.reply({
      embeds: [finalEmbed],
    });
  },
};
