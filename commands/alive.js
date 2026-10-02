const { runtime } = require('../lib/utils');

module.exports = {
  name: 'alive',
  category: 'general',
  desc: 'bot status',
  async run({ reply, config }) {
    await reply(
      `*${config.botName}* is alive\nVersion: ${config.version}\nUptime: ${runtime()}`
    );
  },
};
