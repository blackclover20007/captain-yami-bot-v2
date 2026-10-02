module.exports = {
  name: 'say',
  category: 'tools',
  desc: 'repeat your text',
  usage: '<text>',
  async run({ args, reply, config }) {
    if (!args.length) return reply(`Usage: ${config.prefix}say <text>`);
    await reply(args.join(' '));
  },
};
