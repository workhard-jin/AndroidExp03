// Minimal PDF text extractor (FlateDecode + ToUnicode CMaps)
const fs = require('fs');
const zlib = require('zlib');

const file = process.argv[2];
const buf = fs.readFileSync(file);
const s = buf.toString('latin1');

// --- index plain objects ---
const objs = new Map();
const re = /(\d+)\s+0\s+obj\b/g;
let m;
const positions = [];
while ((m = re.exec(s))) positions.push({ num: +m[1], start: m.index + m[0].length });
for (let i = 0; i < positions.length; i++) {
  const p = positions[i];
  const endIdx = s.indexOf('endobj', p.start);
  let end = endIdx === -1 ? s.length : endIdx;
  // guard against "endobj" inside streams: find stream boundaries first
  const raw = s.slice(p.start, end);
  objs.set(p.num, { start: p.start, end });
}

function rawObj(num) {
  const o = objs.get(num);
  if (!o) return null;
  return s.slice(o.start, o.end);
}

function dictOf(num) {
  const r = rawObj(num);
  if (!r) return null;
  const sm = r.indexOf('stream');
  const dict = sm === -1 ? r : r.slice(0, sm);
  return dict;
}

function streamOf(num) {
  const r = rawObj(num);
  if (!r) return null;
  const sm = r.indexOf('stream');
  if (sm === -1) return null;
  let ds = sm + 6;
  if (r[ds] === '\r') ds++;
  if (r[ds] === '\n') ds++;
  // find endstream
  const es = r.indexOf('endstream', ds);
  const data = r.slice(ds, es === -1 ? r.length : es);
  return Buffer.from(data, 'latin1');
}

function inflate(data) {
  try { return zlib.inflateSync(data); } catch (e) {
    try { return zlib.inflateRawSync(data); } catch (e2) { return data; }
  }
}

// --- object streams ---
for (const [num] of Array.from(objs)) {
  const d = dictOf(num);
  if (d && /\/Type\s*\/ObjStm/.test(d)) {
    const n = +(d.match(/\/N\s+(\d+)/) || [])[1];
    const first = +(d.match(/\/First\s+(\d+)/) || [])[1];
    const data = inflate(streamOf(num)).toString('latin1');
    const header = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < n; i++) {
      const onum = header[2 * i], off = header[2 * i + 1];
      const nextOff = (i + 1 < n) ? header[2 * i + 3] : (data.length - first);
      objs.set(onum, { inline: data.slice(first + off, first + nextOff), isInline: true });
    }
  }
}

function getObjBody(num) {
  const o = objs.get(num);
  if (!o) return null;
  if (o.isInline) return o.inline;
  return s.slice(o.start, o.end);
}

// --- ToUnicode CMap parse ---
function parseCMap(num) {
  const d = dictOf(num) || (objs.get(num) && objs.get(num).inline);
  const dataBuf = objs.get(num) && objs.get(num).isInline ? Buffer.from(objs.get(num).inline, 'latin1') : streamOf(num);
  if (!dataBuf) return null;
  let txt = inflate(dataBuf).toString('latin1');
  const map = new Map();
  const hexToStr = h => {
    let out = '';
    for (let i = 0; i + 4 <= h.length; i += 4) out += String.fromCharCode(parseInt(h.substr(i, 4), 16));
    return out;
  };
  let bf;
  const reChar = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((bf = reChar.exec(txt))) {
    const pairs = bf[1].match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g) || [];
    for (const p of pairs) {
      const mm = p.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/);
      map.set(parseInt(mm[1], 16), hexToStr(mm[2]));
    }
  }
  const reRange = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((bf = reRange.exec(txt))) {
    const entries = bf[1].match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]*>|\[[^\]]*\])/g) || [];
    for (const e of entries) {
      const mm = e.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]*>|\[[^\]]*\])/);
      const lo = parseInt(mm[1], 16), hi = parseInt(mm[2], 16);
      if (mm[3].startsWith('[')) {
        const items = mm[3].match(/<[0-9A-Fa-f]*>/g) || [];
        items.forEach((it, idx) => map.set(lo + idx, hexToStr(it.slice(1, -1))));
      } else {
        const base = mm[3].slice(1, -1);
        const baseCode = parseInt(base.slice(-4) || '0', 16);
        const prefix = base.slice(0, -4);
        for (let c = lo; c <= hi && c - lo < 65536; c++) {
          const cp = baseCode + (c - lo);
          map.set(c, hexToStr(prefix + cp.toString(16).padStart(4, '0')));
        }
      }
    }
  }
  return map;
}

// --- pages ---
function findPageObjects() {
  const pages = [];
  for (const [num, o] of objs) {
    const body = getObjBody(num);
    if (body && /\/Type\s*\/Page\b/.test(body) && !/\/Pages\b/.test(body.slice(0, 200))) pages.push(num);
  }
  return pages;
}

function resolveRef(str, reStr) {
  const mm = str && str.match(reStr);
  return mm ? +mm[1] : null;
}

const contentDecoders = {
  FlateDecode: inflate,
};

function decodeStream(num) {
  const d = dictOf(num) || (objs.get(num) && objs.get(num).inline) || '';
  let data = objs.get(num) && objs.get(num).isInline ? Buffer.from(objs.get(num).inline, 'latin1') : streamOf(num);
  const filters = (d.match(/\/Filter\s*(\[[^\]]*\]|\/\w+)/) || [])[1] || '';
  const fl = filters.match(/\/\w+/g) || [];
  for (const f of fl) {
    const name = f.slice(1);
    if (contentDecoders[name]) data = contentDecoders[name](data);
  }
  return data.toString('latin1');
}

// text operator parser
function parseContent(txt, fontMaps) {
  const out = [];
  let curFont = null, fontSize = 12;
  let tm = [1, 0, 0, 1, 0, 0];
  let tlm = [1, 0, 0, 1, 0, 0];
  let stack = [];
  let i = 0;
  const n = txt.length;

  function mul(a, b) {
    return [
      a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
      a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
      a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5],
    ];
  }

  function showString(bytes) {
    const map = curFont ? fontMaps[curFont] : null;
    let str = '';
    if (map) {
      // determine 2-byte for Type0 (assume 2-byte if map keys > 255)
      const wide = map.wide;
      if (wide) {
        for (let k = 0; k + 1 < bytes.length; k += 2) {
          const code = (bytes[k] << 8) | bytes[k + 1];
          str += map.get(code) !== undefined ? map.get(code) : '';
        }
      } else {
        for (let k = 0; k < bytes.length; k++) {
          const v = map.get(bytes[k]);
          if (v !== undefined) str += v;
          else if (bytes[k] >= 32 && bytes[k] < 127) str += String.fromCharCode(bytes[k]);
        }
      }
    } else {
      str = bytes.map(b => String.fromCharCode(b)).join('');
    }
    out.push({ x: tm[4], y: tm[5], size: Math.abs(tm[3] * fontSize) || fontSize, text: str });
  }

  function parseStringLiteral() {
    // assumes txt[i] === '('
    let depth = 0, res = [];
    i++;
    while (i < n) {
      const c = txt[i];
      if (c === '\\') {
        const nx = txt[i + 1];
        const map = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };
        if (map[nx] !== undefined) { res.push(map[nx]); i += 2; continue; }
        if (/[0-7]/.test(nx)) {
          let oct = '';
          let j = i + 1;
          while (j < n && oct.length < 3 && /[0-7]/.test(txt[j])) { oct += txt[j]; j++; }
          res.push(parseInt(oct, 8)); i = j; continue;
        }
        if (nx === '\n') { i += 2; continue; }
        if (nx === '\r') { i += 3; continue; }
        res.push(nx.charCodeAt(0)); i += 2; continue;
      }
      if (c === '(') { depth++; res.push(40); i++; continue; }
      if (c === ')') { if (depth === 0) { i++; break; } depth--; res.push(41); i++; continue; }
      res.push(c.charCodeAt(0)); i++;
    }
    return res;
  }

  function parseHexString() {
    i++; // <
    let hex = '';
    while (i < n && txt[i] !== '>') { if (/[0-9A-Fa-f]/.test(txt[i])) hex += txt[i]; i++; }
    i++;
    if (hex.length % 2) hex += '0';
    const bytes = [];
    for (let k = 0; k < hex.length; k += 2) bytes.push(parseInt(hex.substr(k, 2), 16));
    return bytes;
  }

  function readToken() {
    while (i < n && /\s/.test(txt[i])) i++;
    if (i >= n) return null;
    const c = txt[i];
    if (c === '(') return { type: 'str', val: parseStringLiteral() };
    if (c === '<' && txt[i + 1] !== '<') return { type: 'str', val: parseHexString() };
    if (c === '[') { i++; return { type: 'arr' }; }
    if (c === ']') { i++; return { type: 'arrEnd' }; }
    if (c === '<' && txt[i + 1] === '<') {
      // skip dict
      let depth = 0;
      while (i < n) {
        if (txt[i] === '<' && txt[i + 1] === '<') { depth++; i += 2; continue; }
        if (txt[i] === '>' && txt[i + 1] === '>') { depth--; i += 2; if (depth === 0) break; continue; }
        i++;
      }
      return { type: 'dict' };
    }
    if (c === '/') {
      let j = i + 1;
      while (j < n && !/[\s\/\[\]<>\(\)%]/.test(txt[j])) j++;
      const v = txt.slice(i + 1, j); i = j;
      return { type: 'name', val: v };
    }
    if (/[-+.0-9]/.test(c)) {
      let j = i;
      while (j < n && /[-+.0-9eE]/.test(txt[j])) j++;
      const v = parseFloat(txt.slice(i, j)); i = j;
      return { type: 'num', val: v };
    }
    // operator
    let j = i;
    while (j < n && !/[\s\/\[\]<>\(\)%]/.test(txt[j])) j++;
    const op = txt.slice(i, j); i = j;
    return { type: 'op', val: op };
  }

  let tok;
  const arrStack = [];
  while ((tok = readToken())) {
    if (tok.type === 'arr') { arrStack.push([]); continue; }
    if (tok.type === 'arrEnd') { const a = arrStack.pop() || []; stack.push({ type: 'arr', val: a }); continue; }
    if (tok.type === 'str' || tok.type === 'num' || tok.type === 'name' || tok.type === 'dict') {
      if (tok.type === 'str' && txt[i - 1] !== undefined) { /* noop */ }
      if (arrStack.length) arrStack[arrStack.length - 1].push(tok);
      else stack.push(tok);
      continue;
    }
    if (tok.type === 'op') {
      const op = tok.val;
      if (op === 'BT') { tm = [1, 0, 0, 1, 0, 0]; tlm = tm.slice(); }
      else if (op === 'Tf') {
        const fname = stack.length >= 2 ? stack[stack.length - 2] : null;
        const fsz = stack.length >= 1 ? stack[stack.length - 1] : null;
        if (fname && fname.type === 'name') curFont = fname.val;
        if (fsz && fsz.type === 'num') fontSize = fsz.val;
      } else if (op === 'Tm') {
        const v = stack.slice(-6).map(o => o.val);
        if (v.length === 6) { tm = v.slice(); tlm = v.slice(); }
      } else if (op === 'Td' || op === 'TD') {
        const v = stack.slice(-2).map(o => o.val);
        if (v.length === 2) { tlm = mul([1, 0, 0, 1, v[0], v[1]], tlm); tm = tlm.slice(); }
      } else if (op === 'T*') {
        tlm = mul([1, 0, 0, 1, 0, -(fontSize * 1.2)], tlm); tm = tlm.slice();
      } else if (op === 'Tj') {
        const st = stack[stack.length - 1];
        if (st && st.type === 'str') showString(st.val);
      } else if (op === "'") {
        tlm = mul([1, 0, 0, 1, 0, -(fontSize * 1.2)], tlm); tm = tlm.slice();
        const st = stack[stack.length - 1];
        if (st && st.type === 'str') showString(st.val);
      } else if (op === '"') {
        const st = stack[stack.length - 1];
        if (st && st.type === 'str') showString(st.val);
      } else if (op === 'TJ') {
        const st = stack[stack.length - 1];
        if (st && st.type === 'arr') {
          for (const item of st.val) {
            if (item.type === 'str') showString(item.val);
            else if (item.type === 'num') tm[4] -= item.val / 1000 * fontSize;
          }
        }
      }
      stack = [];
    }
  }
  return out;
}

// --- resources font extraction ---
function getFontMaps(pageNum) {
  const body = getObjBody(pageNum);
  let resStr = body.match(/\/Resources\s*(\d+)\s+0\s+R/);
  let resBody = resStr ? getObjBody(+resStr[1]) : body;
  const fontMaps = {};
  let fontDict = '';
  if (resBody) {
    const fm = resBody.match(/\/Font\s*<<([\s\S]*?)>>/);
    if (fm) fontDict = fm[1];
    else {
      const fr = resBody.match(/\/Font\s*(\d+)\s+0\s+R/);
      if (fr) fontDict = getObjBody(+fr[1]) || '';
    }
  }
  const reF = /\/(\w+)\s+(\d+)\s+0\s+R/g;
  let mm;
  while ((mm = reF.exec(fontDict))) {
    const fname = mm[1], fnum = +mm[2];
    const fb = dictOf(fnum) || '';
    const tu = fb.match(/\/ToUnicode\s*(\d+)\s+0\s+R/);
    let map = tu ? parseCMap(+tu[1]) : null;
    if (!map) map = new Map();
    const isType0 = /\/Subtype\s*\/Type0/.test(fb);
    map.wide = isType0;
    fontMaps[fname] = map;
  }
  return fontMaps;
}

const pageNums = findPageObjects();
const pagesText = [];
for (const pn of pageNums) {
  const body = getObjBody(pn);
  const fontMaps = getFontMaps(pn);
  const cm = body.match(/\/Contents\s*(\d+)\s+0\s+R/);
  const cmArr = body.match(/\/Contents\s*\[([\s\S]*?)\]/);
  let txt = '';
  if (cmArr) {
    const refs = cmArr[1].match(/(\d+)\s+0\s+R/g) || [];
    for (const r of refs) txt += decodeStream(+r.match(/\d+/)[0]);
  } else if (cm) {
    txt = decodeStream(+cm[1]);
  }
  const items = parseContent(txt, fontMaps);
  pagesText.push({ pn, items });
}

// group into lines
let output = '';
for (const { pn, items } of pagesText) {
  output += `\n\n===== PAGE (obj ${pn}) =====\n`;
  const groups = [];
  for (const it of items) {
    if (!it.text.trim()) continue;
    let g = groups.find(g => Math.abs(g.y - it.y) < 3);
    if (!g) { g = { y: it.y, parts: [] }; groups.push(g); }
    g.parts.push(it);
  }
  groups.sort((a, b) => b.y - a.y);
  for (const g of groups) {
    g.parts.sort((a, b) => a.x - b.x);
    output += g.parts.map(p => p.text).join('') + '\n';
  }
}
fs.writeFileSync(process.argv[3], output, 'utf8');
console.log('pages:', pageNums.length, 'chars:', output.length);
console.log(output.slice(0, 3000));
