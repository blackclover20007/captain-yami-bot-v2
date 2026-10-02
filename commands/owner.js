module.exports = {
  name: 'owner',
  category: 'general',
  desc: 'owner contact',
  async run({ sock, msg, from, config }) {
    const vcard =
      'BEGIN:VCARD\nVERSION:3.0\n' +
      `FN:${config.botName} Owner\n` +
      `TEL;type=CELL;waid=${config.ownerNumber}:+${config.ownerNumber}\n` +
      'END:VCARD';
    await sock.sendMessage(
      from,
      { contacts: { displayName: 'Owner', contacts: [{ vcard }] } },
      { quoted: msg }
    );
  },
};
