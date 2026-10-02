module.exports = {
  name: 'tagall',
  category: 'group',
  desc: 'mention everyone in the group',
  async run({ sock, msg, from, reply }) {
    if (!from.endsWith('@g.us')) return reply('Groups only.');
    const meta = await sock.groupMetadata(from);
    const ids = meta.participants.map((p) => p.id);
    await sock.sendMessage(
      from,
      { text: ids.map((id) => `@${id.split('@')[0]}`).join('\n'), mentions: ids },
      { quoted: msg }
    );
  },
};
