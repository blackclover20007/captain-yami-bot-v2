const { runtime } = require('../lib/utils');

module.exports = {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'general',
  desc: 'how long the bot has been running',
  async run({ reply }) {
    await reply(`Uptime: ${runtime()}`);
  },
};
