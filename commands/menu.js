const { buildMenu } = require('../lib/menu');

module.exports = {
  name: 'menu',
  aliases: ['help', 'cmds'],
  category: 'general',
  desc: 'show all commands',
  async run({ sock, msg, from, config, commands }) {
    await sock.sendMessage(
      from,
      { image: { url: config.startupImage }, caption: buildMenu(commands) },
      { quoted: msg }
    );
  },
};
