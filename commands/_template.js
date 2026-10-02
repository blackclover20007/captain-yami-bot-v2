// Files starting with "_" are ignored. Copy this file, rename it
// (e.g. hello.js), remove the underscore rule by not starting with "_",
// edit the fields, and restart the bot. It appears in the menu by itself.
module.exports = {
  name: 'hello',          // typed as .hello
  aliases: ['hi'],        // optional: .hi also works
  category: 'fun',        // general, tools, group, fun, download, owner, or your own
  desc: 'say hello',      // shown in the menu
  usage: '',              // optional, e.g. '<text>'
  hidden: false,          // true = works but not shown in menu
  async run({ sock, msg, from, args, reply, config, commands }) {
    await reply(`Hello! I'm ${config.botName}`);
  },
};
