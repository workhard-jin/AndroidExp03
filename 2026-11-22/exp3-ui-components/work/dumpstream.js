const fs = require('fs');
const zlib = require('zlib');
const s = fs.readFileSync(process.argv[2]).toString('latin1');

// find object 17 stream
function getStream(num) {
  const re = new RegExp('(?:^|\\n)' + num + ' 0 obj');
  const m = re.exec(s);
  if (!m) return null;
  const start = m.index + m[0].length;
  const sm = s.indexOf('stream', start);
  let ds = sm + 6;
  if (s[ds] === '\r') ds++;
  if (s[ds] === '\n') ds++;
  const es = s.indexOf('endstream', ds);
  return zlib.inflateSync(Buffer.from(s.slice(ds, es), 'latin1')).toString('latin1');
}
const t = getStream(+process.argv[3]);
fs.writeFileSync(process.argv[4], t, 'utf8');
console.log(t.slice(0, 2500));
