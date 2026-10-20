// Local stand-in for backend/Code.gs, for testing: node backend/mock_server.js [port]   (teacher key: TEST01)
const http = require('http');
const KEY = 'TEST01', tabs = {};
const tab = (l, c) => { const n = l + ' ' + String(c).toUpperCase(); return (tabs[n] = tabs[n] || { epoch: Date.now(), rows: [] }); };
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'application/json');
  const u = new URL(req.url, 'http://x'), p = Object.fromEntries(u.searchParams);
  if (req.method === 'GET') {
    if (p.op !== 'poll') return res.end(JSON.stringify({ ok: true }));
    const n = p.lesson + ' ' + String(p.cls).toUpperCase(), t = tabs[n];
    if (!t) return res.end(JSON.stringify({ ok: true, epoch: 0, last: 1, more: false, full: p.epoch !== '0', ops: [] }));
    const full = String(t.epoch) !== String(p.epoch); let since = full ? 1 : Math.max(1, Number(p.since) || 1);
    const lastRow = t.rows.length + 1, to = Math.min(lastRow, since + 300);
    return res.end(JSON.stringify({ ok: true, epoch: t.epoch, last: to, more: to < lastRow, full, ops: t.rows.slice(since - 1, to - 1) }));
  }
  let body = ''; req.on('data', (d) => (body += d)); req.on('end', () => {
    let b; try { b = JSON.parse(body); } catch (e) { return res.end('{"ok":false}'); }
    if (String(b.key || '').toUpperCase() !== KEY) return res.end(JSON.stringify({ ok: false, error: 'badkey' }));
    if (b.op === 'check') return res.end('{"ok":true}');
    if (b.op === 'resetall') { let n = 0; Object.values(tabs).forEach((t) => { t.rows = []; t.epoch = Date.now() + n++; }); return res.end(JSON.stringify({ ok: true, cleared: n })); }
    const t = tab(b.lesson, b.cls);
    (b.ops || []).forEach((op) => { if (op.a === 'reset') { t.rows = []; t.epoch = Date.now(); } else t.rows.push(JSON.stringify(op)); });
    res.end(JSON.stringify({ ok: true, epoch: t.epoch, last: t.rows.length + 1 }));
  });
}).listen(Number(process.argv[2]) || 8790);
