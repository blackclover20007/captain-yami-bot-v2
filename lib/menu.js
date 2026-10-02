const config = require('../config');
const { font } = require('./font');
const { runtime } = require('./utils');

// Icon + title for each category. Unknown categories get a 📌 automatically.
const meta = {
  general: ['⚡', 'GENERAL'],
  tools: ['🛠️', 'TOOLS'],
  group: ['👥', 'GROUP'],
  fun: ['🎮', 'FUN'],
  download: ['📥', 'DOWNLOAD'],
  owner: ['👑', 'OWNER'],
};
const order = Object.keys(meta);

function buildMenu(commands) {
  const p = config.prefix;
  const b = (t) => font(t, 'bold');

  const list = [...new Set(commands.values())].filter((c) => !c.hidden);

  const groups = {};
  for (const c of list) {
    const key = (c.category || 'general').toLowerCase();
    (groups[key] ||= []).push(c);
  }
  const cats = Object.keys(groups).sort((x, y) => {
    const ix = order.indexOf(x), iy = order.indexOf(y);
    return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy) || x.localeCompare(y);
  });

  const date = new Date().toLocaleString('en-GB', {
    timeZone: config.timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);

  let out =
    `╔══════════════════╗\n` +
    `║  🏴‍☠️ ${b(config.botName.toUpperCase())}\n` +
    `║  ✦ ${b('POWERED BY USERBOT')} ✦\n` +
    `╚══════════════════╝\n\n` +
    `┏━━━〔 ${b('BOT INFO')} 〕━━━┓\n` +
    `┃ 👑 ${b('Owner')} : wa.me/${config.ownerNumber}\n` +
    `┃ 🤖 ${b('Version')} : ${config.version}\n` +
    `┃ 🔹 ${b('Prefix')} : ${p}\n` +
    `┃ ⏱️ ${b('Uptime')} : ${runtime()}\n` +
    `┃ 📅 ${b('Date')} : ${date}\n` +
    `┃ 💾 ${b('RAM')} : ${ram} MB\n` +
    `┃ 📦 ${b('Commands')} : ${list.length}\n` +
    `┗━━━━━━━━━━━━━━━━━┛\n`;

  for (const key of cats) {
    const [icon, title] = meta[key] || ['📌', key.toUpperCase()];
    const cmds = groups[key].sort((x, y) => x.name.localeCompare(y.name));
    out += `\n╭━━❮ ${icon} ${b(title)} ❯━━╮\n`;
    for (const c of cmds) {
      const usage = c.usage ? ` ${c.usage}` : '';
      out += `┃ ➤ *${p}${c.name}${usage}*\n`;
      if (c.desc) out += `┃    ╰ ${b(c.desc)}\n`;
    }
    out += `╰━━━━━━━━━━━━━━━━╯\n`;
  }

  return out + `\n⌬ ${b(config.description)} ⌬`;
}

module.exports = { buildMenu };
