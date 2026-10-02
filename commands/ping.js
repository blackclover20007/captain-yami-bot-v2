module.exports = {
  name: 'ping',
  category: 'general',
  desc: 'check bot speed',
  async run({ sock, from, reply }) {
    const t = Date.now();
    const sent = await reply('Pinging...');
    await sock.sendMessage(from, { text: `Pong! ${Date.now() - t}ms`, edit: sent.key });
  },
};
