const startTime = Date.now();

function runtime() {
  let s = Math.floor((Date.now() - startTime) / 1000);
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = { startTime, runtime };
