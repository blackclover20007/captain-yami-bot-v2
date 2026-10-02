const fonts = {
  bold: [0x1d5d4, 0x1d5ee, 0x1d7ec],
  italic: [0x1d63c, 0x1d656, null],
  script: [0x1d4d0, 0x1d4ea, null],
  gothic: [0x1d56c, 0x1d586, null],
  mono: [0x1d670, 0x1d68a, 0x1d7f6],
};
const smallCaps = 'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';

function font(text, type = 'bold') {
  return [...String(text)]
    .map((c) => {
      const n = c.charCodeAt(0);
      if (type === 'small') {
        const i = c.toLowerCase().charCodeAt(0) - 97;
        return i >= 0 && i < 26 ? smallCaps[i] : c;
      }
      const [U, L, D] = fonts[type];
      if (n >= 65 && n <= 90) return String.fromCodePoint(U + n - 65);
      if (n >= 97 && n <= 122) return String.fromCodePoint(L + n - 97);
      if (D && n >= 48 && n <= 57) return String.fromCodePoint(D + n - 48);
      return c;
    })
    .join('');
}

module.exports = { font };
