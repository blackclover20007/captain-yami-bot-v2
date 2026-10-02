const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  jidNormalizedUser,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// ---------- Command loader ----------
// Every .js file in ./commands (not starting with "_") is loaded automatically
const commands = new Map();

function loadCommands() {
  commands.clear();
  const dir = path.join(__dirname, 'commands');
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.startsWith('_')) continue;
    try {
      const cmd = require(path.join(dir, file));
      if (!cmd.name || typeof cmd.run !== 'function') {
        console.log(`Skipped ${file}: needs "name" and "run"`);
        continue;
      }
      commands.set(cmd.name.toLowerCase(), cmd);
      for (const a of cmd.aliases || []) commands.set(a.toLowerCase(), cmd);
    } catch (e) {
      console.log(`Failed to load ${file}: ${e.message}`);
    }
  }
  console.log(`Loaded ${new Set(commands.values()).size} commands`);
}

// ---------- Pairing prompt ----------
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function askNumber() {
  while (true) {
    const input = await ask(
      `\n${config.botName}: enter your WhatsApp number with country code (e.g. 263784970429): `
    );
    const num = input.replace(/\D/g, '');
    if (num.length >= 10 && num.length <= 15) return num;
    console.log('Invalid number. Use digits only, with country code, no + or spaces.');
  }
}

function getText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

// ---------- Bot ----------
async function start() {
  loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  let pairNumber = null;
  if (!state.creds.registered) pairNumber = await askNumber();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
  });

  if (pairNumber) {
    setTimeout(async () => {
      let code;
      try {
        code = await sock.requestPairingCode(pairNumber, config.pairingCode);
      } catch (e) {
        try {
          code = await sock.requestPairingCode(pairNumber);
        } catch (err) {
          return console.error('Pairing failed:', err.message);
        }
      }
      const pretty = code.match(/.{1,4}/g)?.join('-') || code;
      console.log(`\n${config.botName} pairing code: ${pretty}`);
      console.log(
        'Open WhatsApp > Linked Devices > Link a device > Link with phone number instead\n' +
          'It will appear as "Ubuntu / Chrome" once linked.\n'
      );
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`${config.botName} v${config.version} connected`);
      const me = jidNormalizedUser(sock.user.id);
      try {
        await sock.sendMessage(me, {
          image: { url: config.startupImage },
          caption:
            `*${config.botName}* is online\n` +
            `Version: ${config.version}\n` +
            `Prefix: ${config.prefix}\n` +
            `Type ${config.prefix}menu to see commands`,
        });
      } catch (e) {
        console.error('Startup message failed:', e.message);
      }
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log('Logged out. Delete the ./session folder and restart.');
      } else {
        console.log('Connection closed, reconnecting...');
        start();
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg?.message) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.fromMe
      ? jidNormalizedUser(sock.user.id)
      : msg.key.participant || from;
    const senderNum = sender.split('@')[0].split(':')[0];

    // Only the linked account or the owner number can use commands
    if (!(msg.key.fromMe || senderNum === config.ownerNumber)) return;

    const text = getText(msg).trim();
    if (!text.startsWith(config.prefix)) return;

    const [name, ...args] = text.slice(config.prefix.length).split(/\s+/);
    const cmd = commands.get(name.toLowerCase());
    if (!cmd) return;

    const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });

    try {
      await cmd.run({ sock, msg, from, sender, args, text, reply, config, commands });
    } catch (e) {
      console.error(`Error in ${cmd.name}:`, e);
      await reply(`Error running ${config.prefix}${cmd.name}`);
    }
  });
}

start();
