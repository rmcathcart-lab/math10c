/* ============================================================
 * Math 10C Practice — teacher ledger (Google Apps Script backend)
 * ------------------------------------------------------------
 * A standalone Apps Script project deployed as a web app (Execute as: me · Who has access: Anyone).
 * It only stores data: the student site and the teacher dashboard are static pages on GitHub Pages.
 *
 * Run setup() once from the editor: it creates the "Math 10C Practice Ledger" spreadsheet and a teacher key,
 * and logs both (View → Logs / Execution log).
 *
 * Sheets (created automatically):
 *   Roster    one row per student: class, name, PIN (salted hash), first/last seen, devices, and from the class list:
 *             PowerSchool student number, pronouns (he | she | they | blank), IPP (Y or blank)
 *   Attempts  one row per answer checked (right, wrong, format nudge, ladder/tree step), tagged in class Y/N
 *   Events    question opened, left the page (new numbers), answer revealed, new version, away
 *   Progress  one row per student per lesson: counts + the lesson state (for resuming on another device)
 *   Days      one row per student per lesson per day: seconds worked (all / in class), answers, right, first try
 *
 * Script properties: SHEET_ID, TEACHER_KEY, SECRET (token signing), CLASSES (list of class codes with a roster),
 *   BLOCKS ({ class: 'A'..'D' }), NOSCHOOL (["2026-10-12", …]), CAL:<class> (the class calendar, see js/calendar.js:
 *   { v, start, items: [[lesson or test key, class-day slot]…], skipped }). Live "who is on right now" lives in the script cache.
 * In class: an answer counts as in class when the student's device stamped it inside the class's block on the bell
 * schedule AND it reached the server inside the block (+5 min for batching). A class with no block = always in class.
 * ============================================================ */

var COLS = {
  Roster: ['class', 'name', 'pin', 'pinSet', 'firstSeen', 'lastSeen', 'devices', 'fails', 'lockUntil', 'num', 'pronouns', 'ipp'],
  Attempts: ['time', 'class', 'name', 'lesson', 'item', 'label', 'outcome', 'level', 'extra', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass', 'device'],
  Events: ['time', 'class', 'name', 'lesson', 'item', 'type', 'secs', 'inClass'],
  Progress: ['key', 'class', 'name', 'lesson', 'reqDone', 'req', 'reqFirst', 'extraDone', 'extra', 'clientSecs', 'updated', 'state'],
  Days: ['key', 'date', 'class', 'name', 'lesson', 'secs', 'secsIn', 'answers', 'right', 'firstTry']
};
var TZ = 'America/Edmonton';

/* ---------------- plumbing ---------------- */
function props_() { return PropertiesService.getScriptProperties(); }
function ss_() {
  var id = props_().getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.create('Math 10C Practice Ledger'); props_().setProperty('SHEET_ID', ss.getId());
  return ss;
}
var SHEETS_ = {};
function sheet_(name) {
  if (SHEETS_[name]) return SHEETS_[name];
  var ss = ss_(), sh = ss.getSheetByName(name), cols = COLS[name];
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold'); }
  return (SHEETS_[name] = sh);
}
function header_(name) { // a sheet made before new columns were added: write the full header row once
  var sh = sheet_(name), cols = COLS[name];
  if (String(sh.getRange(1, cols.length).getValue()) !== cols[cols.length - 1]) sh.getRange(1, 1, 1, cols.length).setValues([cols]);
  return sh;
}
function rows_(name) { var sh = sheet_(name), n = sh.getLastRow() - 1; return n > 0 ? sh.getRange(2, 1, n, COLS[name].length).getValues() : []; }
function col_(name, c) { return COLS[name].indexOf(c); }
function json_(obj, cb) {
  var txt = JSON.stringify(obj);
  if (cb && /^[A-Za-z_$][\w$]*$/.test(cb)) return ContentService.createTextOutput(cb + '(' + txt + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}
function norm_(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
function clean_(s, max) { s = String(s == null ? '' : s).replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim(); if (s.length > max) s = s.slice(0, max); return /^[=+\-@]/.test(s) ? "'" + s : s; } // a leading = + - @ would make Sheets read a formula
function list_(p) { try { var v = JSON.parse(props_().getProperty(p) || 'null'); return v; } catch (e) { return null; } }
function save_(p, v) { props_().setProperty(p, JSON.stringify(v)); }
function teacherKey_() { return props_().getProperty('TEACHER_KEY') || ''; }
function secret_() { var s = props_().getProperty('SECRET'); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props_().setProperty('SECRET', s); } return s; }
function hex_(bytes) { return bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }
function hashPin_(klass, name, pin) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secret_() + '|' + norm_(klass) + '|' + norm_(name) + '|' + pin)); }
function token_(klass, name, pinHash) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(norm_(klass) + '|' + norm_(name) + '|' + pinHash, secret_())).slice(0, 24); }
function day_(ms) { return Utilities.formatDate(new Date(ms), TZ, 'yyyy-MM-dd'); }

function setup() {
  var ss = ss_(); Object.keys(COLS).forEach(function (n) { sheet_(n); });
  var s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  if (!teacherKey_()) props_().setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 12));
  secret_();
  Logger.log('Ledger spreadsheet: ' + ss.getUrl());
  Logger.log('Teacher key: ' + teacherKey_());
}

/* ---------------- classes and rosters ---------------- */
function classes_() { var c = list_('CLASSES'); return Array.isArray(c) ? c : []; } // [{code, label}]
/* A class keeps its first code inside the spreadsheet forever (it is in every row and in the students' PINs).
 * Changing the code in Settings stores the new one as c.show: links and typing use it, and canon_ turns it back
 * into the first code. The old code keeps working too, so links and QR codes already handed out still work. */
function canon_(code) {
  var k = norm_(code); if (!k) return k; var cs = classes_(), i;
  for (i = 0; i < cs.length; i++) if (cs[i].code === k) return k;
  for (i = 0; i < cs.length; i++) if (cs[i].show && cs[i].show === k) return cs[i].code;
  return k;
}
function showOf_(c) { return c.show || c.code; }
function renameClass_(klass, label, show) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var cs = classes_(), k = norm_(klass), c = null; cs.forEach(function (x) { if (x.code === k) c = x; });
    if (!c) return { ok: false, error: 'unknown class' };
    if (label != null && String(label).trim()) c.label = clean_(label, 40);
    if (show != null && String(show).trim()) {
      var s = norm_(show).replace(/[^a-z0-9\-_ ]/g, '').slice(0, 24); if (!s) return { ok: false, error: 'That class code has no letters or numbers in it.' };
      var taken = cs.some(function (x) { return x !== c && (x.code === s || x.show === s); });
      if (taken) return { ok: false, error: 'Another class already uses the code ' + s + '.' };
      if (s === c.code) delete c.show; else c.show = s;
    }
    save_('CLASSES', cs);
    return { ok: true, 'class': { code: c.code, label: c.label || c.code, show: showOf_(c) } };
  } finally { lock.releaseLock(); }
}
function classOf_(code) { var k = norm_(code), c = classes_(); for (var i = 0; i < c.length; i++) if (c[i].code === k) return c[i]; return null; }
function rosterRows_(klass) { var k = norm_(klass); return rows_('Roster').map(function (r, i) { return { row: i + 2, v: r }; }).filter(function (x) { return norm_(x.v[0]) === k; }); }
function findStudent_(klass, name) { var n = norm_(name), rs = rosterRows_(klass); for (var i = 0; i < rs.length; i++) if (norm_(rs[i].v[1]) === n) return rs[i]; return null; }

/* ---------------- reads ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {}, cb = p.callback || '';
  try {
    var a = p.action || 'ping';
    if (p['class']) p['class'] = canon_(p['class']); // a class code that was changed: the new code finds the class
    if (a === 'ping') return json_({ ok: true, t: Date.now() }, cb);
    if (a === 'roster') return json_(roster_(p['class']), cb);
    if (a === 'setpin') return json_(setPin_(p['class'], p.name, p.pin, p.device), cb);
    if (a === 'signin') return json_(signIn_(p['class'], p.name, p.pin, p.device), cb);
    if (a === 'progress') return json_(progress_(p['class'], p.name, p.token), cb);
    if (a === 'tcheck') return json_(tcheck_(p), cb);
    if (a === 'myresults') return json_(myResults_(p), cb);
    if (a === 'myretests') return json_(myRetests_(p), cb);
    if (a === 'reqretest') return json_(reqRetest_(p), cb);
    if (a === 'cal') return json_(cal_(p['class'] || classByBlock_(p.block)), cb);
    if (!teacherKey_() || p.key !== teacherKey_()) return json_({ ok: false, error: 'bad key' }, cb);
    if (a === 'classes') return json_(classList_(), cb);
    if (a === 'dash') return json_(dash_(p['class']), cb);
    if (a === 'live') return json_({ ok: true, live: live_(p['class']), now: Date.now() }, cb);
    if (a === 'student') return json_(student_(p['class'], p.name), cb);
    if (a === 'setroster') return json_(setRoster_(p['class'], p.label, p.names, p.mode, p.students, p.ps), cb);
    if (a === 'delclass') return json_(delClass_(p['class']), cb);
    if (a === 'renameclass') return json_(renameClass_(p['class'], p.label, p.code), cb);
    if (a === 'resetpin') return json_(resetPin_(p['class'], p.name), cb);
    if (a === 'rename') return json_(rename_(p['class'], p.name, p.to), cb);
    if (a === 'removestudent') return json_(removeStudent_(p['class'], p.name), cb);
    if (a === 'setstudent') return json_(setStudent_(p['class'], p.name, p), cb);
    if (a === 'setblock') return json_(setBlock_(p['class'], p.block), cb);
    if (a === 'setnoschool') return json_(setNoSchool_(p.dates), cb);
    if (a === 'setbell') return json_(setBell_(p.bell), cb);
    if (a === 'setlopts') return json_(setLopts_(p['class'], p.standup), cb);
    if (a === 'setcal') return json_(setCal_(p['class'], p.cal, p.all === '1'), cb);
    if (a === 'calsync') return json_(setCalSync_(p.on === '1'), cb);
    if (a === 'tests') return json_(testsList_(), cb);
    if (a === 'savetest') return json_(saveTest_(p.id, p.def), cb);
    if (a === 'deltest') return json_(delTest_(p.id), cb);
    if (a === 'launch') return json_(launch_(p['class'], p.test), cb);
    if (a === 'tlive') return json_(tlive_(p['class'], p.who), cb);
    if (a === 'tctl') return json_(tctl_(p['class'], p.op, p.name, p.mins, p.who), cb);
    if (a === 'retests') return json_(retests_(p['class']), cb);
    if (a === 'retestset') return json_(retestSet_(p.id, p.status), cb);
    if (a === 'launchretest') return json_(launchRetest_(p.id, p.test), cb);
    if (a === 'sessions') return json_(sessions_(p['class']), cb);
    if (a === 'tresults') return json_(tresults_(p.session), cb);
    if (a === 'setmarks') return json_(setMarks_(p.session, p.data), cb);
    if (a === 'release') return json_(release_(p.session, p.on === '1' || p.on === 'true'), cb);
    return json_({ ok: false, error: 'unknown action' }, cb);
  } catch (err) { return json_({ ok: false, error: String(err) }, cb); }
}

function roster_(klass) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var names = rosterRows_(klass).map(function (x) { return { name: String(x.v[1]), pin: !!x.v[2] }; });
  names.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return { ok: true, code: c.code, show: showOf_(c), label: c.label || c.code, names: names, times: { block: blockFor_(klass), noSchool: noSchool_() } };
}
function locked_(st) { var u = Number(st.v[8] || 0); return u && u > Date.now(); }
function addDevice_(st, device) {
  var d = []; try { d = JSON.parse(st.v[6] || '[]'); } catch (e) {}
  if (device && d.indexOf(String(device).slice(0, 40)) < 0) { d.push(String(device).slice(0, 40)); if (d.length > 12) d = d.slice(-12); }
  return JSON.stringify(d);
}
function setPin_(klass, name, pin, device) {
  if (!/^\d{4}$/.test(String(pin || ''))) return { ok: false, error: 'badpin' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' };
    if (st.v[2]) return { ok: false, error: 'haspin' };
    var h = hashPin_(klass, st.v[1], pin), now = new Date(), sh = sheet_('Roster');
    sh.getRange(st.row, 3, 1, 7).setValues([[h, now, st.v[4] || now, now, addDevice_(st, device), 0, '']]);
    return { ok: true, token: token_(klass, st.v[1], h), name: st.v[1] };
  } finally { lock.releaseLock(); }
}
function signIn_(klass, name, pin, device) {
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' };
    if (!st.v[2]) return { ok: false, error: 'nopin' };
    if (locked_(st)) return { ok: false, error: 'locked' };
    var sh = sheet_('Roster');
    if (hashPin_(klass, st.v[1], String(pin || '')) !== st.v[2]) {
      var fails = Number(st.v[7] || 0) + 1;
      sh.getRange(st.row, 8, 1, 2).setValues([[fails, fails >= 8 ? Date.now() + 10 * 60000 : '']]);
      return { ok: false, error: fails >= 8 ? 'locked' : 'badpin' };
    }
    sh.getRange(st.row, 6, 1, 4).setValues([[new Date(), addDevice_(st, device), 0, '']]);
    return { ok: true, token: token_(klass, st.v[1], st.v[2]), name: st.v[1] };
  } finally { lock.releaseLock(); }
}
function authed_(klass, name, token) { var st = findStudent_(klass, name); if (!st || !st.v[2]) return null; return token_(klass, st.v[1], st.v[2]) === token ? st : null; }
function progress_(klass, name, token) {
  if (!authed_(klass, name, token)) return { ok: false, error: 'badtoken' };
  var out = {}, k = norm_(klass) + '|' + norm_(name) + '|';
  rows_('Progress').forEach(function (r) { if (String(r[0]).indexOf(k) === 0) { try { out[r[3]] = JSON.parse(r[11] || '{}'); } catch (e) {} } });
  return { ok: true, lessons: out, times: { block: blockFor_(klass), noSchool: noSchool_() } };
}

/* ---------------- writes from the student site ---------------- */
function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (!body || !body.name || !body['class']) return json_({ ok: false, error: 'missing' });
  body['class'] = canon_(body['class']);
  if (body.kind === 'test') { try { return json_(testPost_(body)); } catch (err) { return json_({ ok: false, error: String(err) }); } }
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    var st = authed_(body['class'], body.name, body.token);
    if (!st) return json_({ ok: false, error: 'badtoken' });
    var klass = String(st.v[0]), name = String(st.v[1]), now = Date.now(), block = blockFor_(klass), off = noSchool_();
    var att = [], evs = [], days = {}, dev = clean_(body.device, 40);
    function dayRec(lesson, at) { var d = day_(at), key = norm_(klass) + '|' + norm_(name) + '|' + lesson + '|' + d; return days[key] || (days[key] = { key: key, date: d, lesson: lesson, secs: 0, secsIn: 0, answers: 0, right: 0, first: 0 }); }
    (body.events || []).slice(0, 300).forEach(function (ev) {
      if (!ev || !ev.t) return;
      var at = Number(ev.at) || now; if (at > now + 60000 || at < now - 7 * 864e5) at = now;
      var inC = inClass_(block, off, at, now), lesson = clean_(ev.lesson, 20);
      if (ev.t === 'attempt') {
        att.push([new Date(at), klass, name, lesson, clean_(ev.item, 12), clean_(ev.label, 30), clean_(ev.outcome, 8), clean_(ev.level, 4), ev.extra ? 'Y' : '', ev.practice ? 'Y' : '', Number(ev.ver) || 0,
          clean_(ev.verdict, 10), clean_(ev.code, 30), Number(ev.tryNo) || 0, clean_(ev.answer, 200), clean_(ev.prompt, 300), inC ? 'Y' : 'N', dev]);
        if ((ev.verdict === 'correct' || ev.verdict === 'wrong') && !ev.practice) { var dr = dayRec(lesson, at); dr.answers++; if (ev.verdict === 'correct') { dr.right++; if (Number(ev.tryNo) === 1) dr.first++; } }
      } else if (ev.t === 'event') {
        evs.push([new Date(at), klass, name, lesson, clean_(ev.item, 12), clean_(ev.type, 16), Number(ev.secs) || '', inC ? 'Y' : 'N']);
      } else if (ev.t === 'tick') {
        var s = Math.max(0, Math.min(120, Number(ev.secs) || 0)), d2 = dayRec(lesson, at); d2.secs += s; if (inC) d2.secsIn += s;
      }
    });
    if (att.length) { var a = sheet_('Attempts'); a.getRange(a.getLastRow() + 1, 1, att.length, att[0].length).setValues(att); }
    if (evs.length) { var b = sheet_('Events'); b.getRange(b.getLastRow() + 1, 1, evs.length, evs[0].length).setValues(evs); }
    var dk = Object.keys(days); if (dk.length) upsertDays_(klass, name, dk.map(function (k) { return days[k]; }));
    if (body.progress) upsertProgress_(klass, name, body.progress, now);
    // live status (cache) + last seen
    var stt = body.status || {};
    setLive_(klass, name, { view: clean_(stt.view, 10), lesson: clean_(stt.lesson, 20), item: clean_(stt.item, 12), label: clean_(stt.label, 30), away: !!stt.away, at: now, since: Number(stt.at) || now, inClass: inClass_(block, off, now, now), dev: dev });
    if (!st.v[5] || now - new Date(st.v[5]).getTime() > 60000) sheet_('Roster').getRange(st.row, 6).setValue(new Date(now));
    return json_({ ok: true, wrote: att.length });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
function upsertDays_(klass, name, recs) {
  var sh = sheet_('Days'), last = sh.getLastRow(), keys = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [], idx = {};
  for (var i = keys.length - 1; i >= 0 && i >= keys.length - 4000; i--) idx[keys[i][0]] = i + 2; // recent rows are enough (today)
  var add = [];
  recs.forEach(function (r) {
    var row = idx[r.key];
    if (row) { var v = sh.getRange(row, 6, 1, 5).getValues()[0]; sh.getRange(row, 6, 1, 5).setValues([[Number(v[0]) + r.secs, Number(v[1]) + r.secsIn, Number(v[2]) + r.answers, Number(v[3]) + r.right, Number(v[4]) + r.first]]); }
    else add.push([r.key, r.date, klass, name, r.lesson, r.secs, r.secsIn, r.answers, r.right, r.first]);
  });
  if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, add[0].length).setValues(add);
}
function upsertProgress_(klass, name, prog, now) {
  var sh = sheet_('Progress'), last = sh.getLastRow(), keys = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [], idx = {};
  keys.forEach(function (k, i) { idx[k[0]] = i + 2; });
  Object.keys(prog).slice(0, 20).forEach(function (lesson) {
    var p = prog[lesson] || {}, s = p.summary || {}, key = norm_(klass) + '|' + norm_(name) + '|' + lesson;
    var state = JSON.stringify(p.state || {}); if (state.length > 45000) state = state.slice(0, 45000);
    var row = [key, klass, name, clean_(lesson, 20), Number(s.reqDone) || 0, Number(s.req) || 0, Number(s.reqFirst) || 0, Number(s.extraDone) || 0, Number(s.extra) || 0, Number(s.secs) || 0, new Date(now), state];
    if (idx[key]) sh.getRange(idx[key], 1, 1, row.length).setValues([row]);
    else { sh.appendRow(row); idx[key] = sh.getLastRow(); }
  });
}
function setLive_(klass, name, rec) {
  var c = CacheService.getScriptCache(), k = 'live:' + norm_(klass), m = {};
  try { m = JSON.parse(c.get(k) || '{}'); } catch (e) {}
  m[name] = rec;
  var cut = Date.now() - 6 * 3600000; Object.keys(m).forEach(function (n) { if (m[n].at < cut) delete m[n]; });
  c.put(k, JSON.stringify(m), 21600);
}
function live_(klass) { try { return JSON.parse(CacheService.getScriptCache().get('live:' + norm_(klass)) || '{}'); } catch (e) { return {}; } }

/* ---------------- teacher ---------------- */
function classList_() {
  var counts = {}; rows_('Roster').forEach(function (r) { var k = norm_(r[0]); counts[k] = (counts[k] || 0) + 1; });
  return { ok: true, classes: classes_().map(function (c) { return { code: c.code, show: showOf_(c), label: c.label || c.code, students: counts[c.code] || 0, block: blockFor_(c.code), ps: c.ps || null }; }), noSchool: noSchool_(), bell: bell_(), bellCustom: !!(cachedProp_('BELL').day1) };
}
function dash_(klass) {
  var k = norm_(klass), c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var roster = rosterRows_(klass).map(function (x) { var d = []; try { d = JSON.parse(x.v[6] || '[]'); } catch (e) {} return { name: x.v[1], pin: !!x.v[2], firstSeen: ms_(x.v[4]), lastSeen: ms_(x.v[5]), devices: d.length, num: String(x.v[9] || ''), pronouns: String(x.v[10] || ''), ipp: x.v[11] === 'Y' }; });
  var prog = rows_('Progress').filter(function (r) { return norm_(r[1]) === k; }).map(function (r) { return { name: r[2], lesson: r[3], reqDone: r[4], req: r[5], reqFirst: r[6], extraDone: r[7], extra: r[8], secs: r[9], updated: ms_(r[10]), items: itemsOf_(r[11]) }; });
  var days = rows_('Days').filter(function (r) { return norm_(r[2]) === k; }).map(function (r) { return [r[1] instanceof Date ? Utilities.formatDate(r[1], TZ, 'yyyy-MM-dd') : String(r[1]), r[3], r[4], r[5], r[6], r[7], r[8], r[9]]; });
  var att = rows_('Attempts').filter(function (r) { return norm_(r[1]) === k; }).map(function (r) { return [ms_(r[0]), r[2], r[3], r[4], r[6], r[7], r[8] === 'Y' ? 1 : 0, r[9] === 'Y' ? 1 : 0, r[10], r[11], r[12], r[13], r[14], r[15], r[16] === 'Y' ? 1 : 0]; });
  var evs = rows_('Events').filter(function (r) { return norm_(r[1]) === k && r[5] !== 'open'; }).map(function (r) { return [ms_(r[0]), r[2], r[3], r[4], r[5], r[6], r[7] === 'Y' ? 1 : 0]; });
  return { ok: true, 'class': { code: c.code, show: showOf_(c), label: c.label || c.code, block: blockFor_(klass), ps: c.ps || null }, roster: roster, progress: prog, days: days,
    attempts: att, attemptCols: ['time', 'name', 'lesson', 'item', 'outcome', 'level', 'extra', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass'],
    events: evs, eventCols: ['time', 'name', 'lesson', 'item', 'type', 'secs', 'inClass'], dayCols: ['date', 'name', 'lesson', 'secs', 'secsIn', 'answers', 'right', 'firstTry'],
    live: live_(klass), now: Date.now(), noSchool: noSchool_(), bell: bell_(), bellCustom: !!(cachedProp_('BELL').day1) };
}
function itemsOf_(state) { // compact per-item status for the dashboard: { id: [status, credit, wrong, secs, reveals] }
  var out = {}; try { var s = JSON.parse(state || '{}'), it = s.items || {}; Object.keys(it).forEach(function (id) { var r = it[id]; out[id] = [r.s, r.credit || '', r.wrong || 0, r.secs || 0, r.reveals || 0, r.steps || 0, r.redo ? 1 : 0]; }); } catch (e) {}
  return out;
}
function ms_(v) { return v instanceof Date ? v.getTime() : (v ? new Date(v).getTime() || 0 : 0); }
function student_(klass, name) {
  var k = norm_(klass), n = norm_(name);
  var att = rows_('Attempts').filter(function (r) { return norm_(r[1]) === k && norm_(r[2]) === n; }).map(function (r) { return [ms_(r[0]), r[3], r[4], r[5], r[6], r[7], r[9] === 'Y' ? 1 : 0, r[10], r[11], r[12], r[13], r[14], r[15], r[16] === 'Y' ? 1 : 0, r[17]]; });
  var evs = rows_('Events').filter(function (r) { return norm_(r[1]) === k && norm_(r[2]) === n; }).map(function (r) { return [ms_(r[0]), r[3], r[4], r[5], r[6], r[7] === 'Y' ? 1 : 0]; });
  return { ok: true, attempts: att, attemptCols: ['time', 'lesson', 'item', 'label', 'outcome', 'level', 'practice', 'ver', 'verdict', 'code', 'tryNo', 'answer', 'prompt', 'inClass', 'device'], events: evs, eventCols: ['time', 'lesson', 'item', 'type', 'secs', 'inClass'] };
}
/* Teacher: create or update a class roster. names = one per line (or separated by ;). mode = 'replace' removes students who
 * aren't listed (their work stays in the sheets), 'add' only adds.
 * students = JSON [{ n: name, num: PowerSchool student number, as: the name already on the list it matches }] (from a
 * PowerSchool scores template; used instead of names). ps = JSON { teacher, course, points, type } from that template
 * (the header lines of the score files the ledger makes for PowerSchool). */
function setRoster_(klass, label, names, mode, students, ps) {
  var code = norm_(klass).replace(/[^a-z0-9\-_ ]/g, '').slice(0, 24); if (!code) return { ok: false, error: 'no class code' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var cs = classes_(), c = null; cs.forEach(function (x) { if (x.code === code) c = x; });
    if (!c) { c = { code: code, label: clean_(label || klass, 40) }; cs.push(c); } else if (label) c.label = clean_(label, 40);
    var pi = parseDef_(ps); if (pi) c.ps = { teacher: clean_(pi.teacher, 60), course: clean_(pi.course, 60), points: clean_(pi.points, 10), type: clean_(pi.type, 20) };
    save_('CLASSES', cs);
    var list = [], given = parseDef_(students);
    if (Array.isArray(given)) given.slice(0, 200).forEach(function (x) { var n = clean_(x && x.n, 60); if (n) list.push({ n: n, num: String(x.num == null ? '' : x.num).replace(/[^0-9A-Za-z]/g, '').slice(0, 15), as: clean_(x.as, 60) }); });
    else String(names || '').split(/\r?\n|;/).forEach(function (s) { s = clean_(s, 60); if (s) list.push({ n: s, num: '', as: '' }); });
    var seen = {}; list = list.filter(function (x) { var k = norm_(x.as || x.n); if (seen[k]) return false; seen[k] = 1; return true; });
    var sh = header_('Roster'), have = rosterRows_(code), haveNames = {}; have.forEach(function (x) { haveNames[norm_(x.v[1])] = x; });
    var add = [], numbered = 0, keep = {};
    list.forEach(function (x) {
      var hit = haveNames[norm_(x.as || x.n)];
      if (hit) { keep[norm_(hit.v[1])] = 1; if (x.num && String(hit.v[9]) !== x.num) { sh.getRange(hit.row, 10).setValue(x.num); numbered++; } return; }
      keep[norm_(x.n)] = 1; add.push([code, x.n, '', '', '', '', '[]', 0, '', x.num, '', '']);
    });
    if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, COLS.Roster.length).setValues(add);
    var removed = 0;
    if (mode === 'replace') {
      have.filter(function (x) { return !keep[norm_(x.v[1])]; }).sort(function (a, b) { return b.row - a.row; }).forEach(function (x) { sh.deleteRow(x.row); removed++; });
    }
    return { ok: true, 'class': c, added: add.length, removed: removed, numbered: numbered };
  } finally { lock.releaseLock(); }
}
/* one student's class-list details: num (PowerSchool student number), pronouns (he | she | they | ''), ipp ('1' or '0').
 * Only the fields sent are changed. */
function setStudent_(klass, name, p) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' };
    var sh = header_('Roster'), v = [String(st.v[9] || ''), String(st.v[10] || ''), String(st.v[11] || '')];
    if (p.num != null) v[0] = String(p.num).replace(/[^0-9A-Za-z]/g, '').slice(0, 15);
    if (p.pronouns != null) { if (['', 'he', 'she', 'they'].indexOf(String(p.pronouns)) < 0) return { ok: false, error: 'bad pronouns' }; v[1] = String(p.pronouns); }
    if (p.ipp != null) v[2] = p.ipp === '1' || p.ipp === 'true' ? 'Y' : '';
    sh.getRange(st.row, 10, 1, 3).setValues([v]);
    return { ok: true, num: v[0], pronouns: v[1], ipp: v[2] === 'Y' };
  } finally { lock.releaseLock(); }
}
function delClass_(klass) {
  var code = norm_(klass), lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    save_('CLASSES', classes_().filter(function (c) { return c.code !== code; }));
    try { props_().deleteProperty('CAL:' + code); cache_().remove('P:CAL:' + code); } catch (e) {}
    var sh = sheet_('Roster'); rosterRows_(code).sort(function (a, b) { return b.row - a.row; }).forEach(function (x) { sh.deleteRow(x.row); });
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function dropTok_(klass, name) { try { cache_().remove('tok:' + norm_(klass) + '|' + norm_(name)); } catch (e) {} }
function resetPin_(klass, name) { dropTok_(klass, name); var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' }; sheet_('Roster').getRange(st.row, 3, 1, 2).setValues([['', '']]); sheet_('Roster').getRange(st.row, 8, 1, 2).setValues([[0, '']]); return { ok: true }; }
function removeStudent_(klass, name) { var st = findStudent_(klass, name); if (!st) return { ok: false, error: 'unknown student' }; sheet_('Roster').deleteRow(st.row); return { ok: true }; }
function rename_(klass, name, to) { dropTok_(klass, name); var st = findStudent_(klass, name); to = clean_(to, 60); if (!st || !to) return { ok: false, error: 'unknown student' }; sheet_('Roster').getRange(st.row, 2, 1, 2).setValues([[to, '']]); return { ok: true, note: 'PIN cleared: the student makes a new one.' }; }

/* ---------------- class times: the bell schedule (2026-27) ----------------
 * Mon/Wed are Day 1, Tue/Thu Day 2, Friday has its own shorter periods. [block, start, end] in local time. */
var BELL = {
  day1: [['A', '09:00', '10:28'], ['B', '10:33', '12:00'], ['C', '12:45', '14:13'], ['D', '14:18', '15:45']],
  day2: [['B', '09:00', '10:28'], ['A', '10:33', '12:00'], ['D', '12:45', '14:13'], ['C', '14:18', '15:45']],
  fri:  [['A', '09:00', '10:07'], ['B', '10:11', '11:18'], ['C', '11:48', '12:55'], ['D', '12:58', '14:05']]
};
var BELL_GRACE = 2; // minutes either side of the bells
/* the bell schedule in use: the one saved in the ledger's Settings (property BELL), else the 2026-27 one above */
function bell_() { var b = cachedProp_('BELL'); return b && b.day1 && b.day2 && b.fri ? b : BELL; }
function setBell_(json) {
  if (json === '' || json === 'reset') { props_().deleteProperty('BELL'); cput_('P:BELL', {}); return { ok: true, bell: BELL, custom: false }; }
  var d = parseDef_(json), out = {}, bad = '';
  if (!d) return { ok: false, error: 'bad schedule' };
  ['day1', 'day2', 'fri'].forEach(function (k) {
    out[k] = (Array.isArray(d[k]) ? d[k] : []).slice(0, 8).map(function (x) {
      var b = String(x && x[0] || '').toUpperCase(), a = String(x && x[1] || ''), e = String(x && x[2] || '');
      if (!/^[A-D]$/.test(b) || !/^\d{2}:\d{2}$/.test(a) || !/^\d{2}:\d{2}$/.test(e) || a >= e) bad = bad || (b + ' ' + a + '–' + e);
      return [b, a, e];
    });
  });
  if (bad) return { ok: false, error: 'bad class time: ' + bad };
  saveProp_('BELL', out); return { ok: true, bell: out, custom: true };
}
/* when the class period that's on now (or starts within 15 minutes) ends, as a time in ms; 0 if there isn't one */
function periodEnd_(block, off, ms) {
  if (!block) return 0;
  var p = period_(block, off, ms); if (!p || p.now < p.start - 15 || p.now >= p.end) return 0;
  return ms - (ms % 60000) + (p.end - p.now) * 60000;
}
function blocks_() { var b = list_('BLOCKS'); return (b && typeof b === 'object') ? b : {}; }
function blockFor_(klass) { return blocks_()[norm_(klass)] || ''; }
function noSchool_() { var d = list_('NOSCHOOL'); return Array.isArray(d) ? d : []; }
function period_(block, off, ms) {
  var parts = Utilities.formatDate(new Date(ms), TZ, 'u|HH|mm|yyyy-MM-dd').split('|'), dow = Number(parts[0]);
  if (dow > 5 || off.indexOf(parts[3]) >= 0) return null;
  var B = bell_(), day = dow === 5 ? B.fri : (dow === 1 || dow === 3) ? B.day1 : B.day2, mins = Number(parts[1]) * 60 + Number(parts[2]);
  for (var i = 0; i < day.length; i++) if (day[i][0] === block) { var a = day[i][1].split(':'), b = day[i][2].split(':'); return { now: mins, start: a[0] * 60 + Number(a[1]), end: b[0] * 60 + Number(b[1]) }; }
  return null;
}
function inPeriod_(block, off, ms, extraAfter) { var p = period_(block, off, ms); return !!p && p.now >= p.start - BELL_GRACE && p.now <= p.end + BELL_GRACE + (extraAfter || 0); }
function inClass_(block, off, at, now) { if (!block) return true; return Math.abs(now - at) < 10 * 60000 && inPeriod_(block, off, at, 0) && inPeriod_(block, off, now, 5); }
function setBlock_(klass, block) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var b = String(block || '').trim().toUpperCase(); if (b && !/^[ABCD]$/.test(b)) return { ok: false, error: 'bad block' };
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { var all = blocks_(); if (b) all[k] = b; else delete all[k]; save_('BLOCKS', all); return { ok: true, blocks: all }; }
  finally { lock.releaseLock(); }
}
/* the class calendar (students read it; the teacher saves it from the ledger's Calendar tab). Days off are NOSCHOOL. */
/* the teaching site knows a class by its block letter (?class=B): the class set to that block in the ledger */
function classByBlock_(block) {
  var b = String(block || '').toUpperCase(), bl = blocks_(), hit = '';
  if (!/^[A-D]$/.test(b)) return '';
  classes_().forEach(function (c) { if (!hit && String(bl[c.code] || '').toUpperCase() === b) hit = c.code; });
  return hit;
}
function cal_(klass) {
  var c = classOf_(klass); if (!c) return { ok: true, cal: null, noSchool: noSchool_(), error: 'unknown class' };
  var v = cachedProp_('CAL:' + c.code);
  return { ok: true, 'class': c.code, label: c.label || c.code, cal: v && v.start ? v : null, noSchool: noSchool_(), sync: calSync_(), lopts: lopts_(c.code) };
}
/* lesson-page options for a class (the teaching site reads them with the calendar). standup: Stand Up Break cards on/off. */
function lopts_(code) { var v = list_('LOPTS:' + code); return { standup: !(v && v.standup === false) }; }
function setLopts_(klass, standup) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var on = !(standup === '0' || standup === 0 || standup === false || standup === 'false');
  save_('LOPTS:' + c.code, { standup: on });
  return { ok: true, lopts: lopts_(c.code) };
}
/* CALSYNC: "keep all class calendars the same" (the ledger then saves every change to every class with all=1) */
function calSync_() { return props_().getProperty('CALSYNC') === '1'; }
function setCalSync_(on) { props_().setProperty('CALSYNC', on ? '1' : '0'); return { ok: true, sync: on }; }
function setCal_(klass, json, all) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var targets = all ? classes_() : [c];
  if (json === '' || json === 'null') { targets.forEach(function (t) { props_().deleteProperty('CAL:' + t.code); cput_('P:CAL:' + t.code, {}); }); return { ok: true, cal: null }; }
  var d = parseDef_(json); if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.start || ''))) return { ok: false, error: 'bad calendar' };
  var items = [], skipped = [];
  (Array.isArray(d.items) ? d.items : []).slice(0, 400).forEach(function (x) { if (Array.isArray(x) && /^[a-z0-9]{1,10}$/.test(String(x[0]))) items.push([String(x[0]), Math.max(0, Math.min(2000, Math.round(Number(x[1]) || 0)))]); });
  (Array.isArray(d.skipped) ? d.skipped : []).slice(0, 400).forEach(function (k) { if (/^[a-z0-9]{1,10}$/.test(String(k))) skipped.push(String(k)); });
  var events = [];   // the teacher's own entries: { id, date, title, kind: exam | event, takes (lessons move to the next day) }
  (Array.isArray(d.events) ? d.events : []).slice(0, 60).forEach(function (e) {
    if (!e || !/^\d{4}-\d{2}-\d{2}$/.test(String(e.date || ''))) return;
    var title = clean_(e.title, 60); if (!title) return;
    events.push({ id: clean_(e.id, 12) || ('e' + events.length), date: String(e.date), title: title, kind: e.kind === 'exam' ? 'exam' : 'event', takes: !!e.takes });
  });
  var cal = { v: 1, start: String(d.start), items: items, skipped: skipped };
  if (events.length) cal.events = events;
  if (JSON.stringify(cal).length > 8500) return { ok: false, error: 'calendar too big' };
  targets.forEach(function (t) { saveProp_('CAL:' + t.code, cal); });
  return { ok: true, cal: cal, saved: targets.length };
}
function setNoSchool_(csv) {
  var out = []; String(csv || '').split(/[,\s]+/).forEach(function (x) { x = x.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(x) && out.indexOf(x) < 0) out.push(x); });
  out.sort(); save_('NOSCHOOL', out.slice(-300)); return { ok: true, noSchool: out.slice(-300) };
}

/* ============================================================
 * TEST MODE (exit slips and tests written on the site)
 * ------------------------------------------------------------
 * The teacher saves a test (questions picked from the practice generators or a ready-made unit test), then launches it for
 * a class. Every signed-in student's page checks for a live test every ~10 s and pops it up; each student gets their own
 * numbers (seeded by student + session). Leaving the window ends and locks the student's test; the teacher can unlock it.
 * While a test is live, students' answers live in the script cache (one key per student, no sheet writes, no lock), so a
 * whole class can save every few seconds. A finished test (submitted / left / out of time / ended) is written to the
 * TestResults sheet. Marks are computed by the teacher dashboard from the stored answers (students never see the keys
 * during a test) and saved with setmarks; results reach students only after the teacher releases them.
 *   Tests         saved tests: id, title, kind (exit | test), updated, def (JSON: minutes, calc, shuffle, levels, items)
 *   TestSessions  one row per launch: id, test, class, title, kind, launched, closed, released, def (snapshot)
 *   TestResults   one row per student per session: status, times, leaves, answers JSON, marks, score
 * Script properties: TESTLIVE ({ class: live session, 'class|student': a one-student retest }), TESTREL ({ class: release counter }).
 * A retest is a launch for one student (TestSessions.student set) that runs alongside anything live for the class.
 * ============================================================ */
COLS.Tests = ['id', 'title', 'kind', 'updated', 'def'];
COLS.TestSessions = ['id', 'test', 'class', 'title', 'kind', 'launched', 'closed', 'released', 'def', 'student'];
COLS.TestResults = ['key', 'session', 'class', 'name', 'status', 'started', 'submitted', 'usedSecs', 'leaves', 'device', 'answers', 'marks', 'score', 'total', 'updated'];
var TEST_TTL = 21600; // cache seconds (6 h, the maximum)

function cache_() { return CacheService.getScriptCache(); }
function cget_(k) { try { var v = cache_().get(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function cput_(k, v) { try { cache_().put(k, JSON.stringify(v), TEST_TTL); } catch (e) {} }
/* token check without reading the Roster sheet on every poll */
function authFast_(klass, name, token) {
  var k = 'tok:' + norm_(klass) + '|' + norm_(name), c = cget_(k);
  if (c && c.t === token && token) return { klass: c.k, name: c.n };
  var st = authed_(klass, name, token); if (!st) return null;
  var who = { klass: String(st.v[0]), name: String(st.v[1]) };
  cput_(k, { t: token, k: who.klass, n: who.name });
  return who;
}
/* TESTLIVE / TESTREL live in script properties (the record) and in the cache (what every poll reads: property reads have a
 * daily quota and every signed-in student polls every 10 s) */
function cachedProp_(p) { var c = cget_('P:' + p); if (c && typeof c === 'object') return c; var v = list_(p); v = (v && typeof v === 'object') ? v : {}; cput_('P:' + p, v); return v; }
function saveProp_(p, v) { save_(p, v); cput_('P:' + p, v); }
function testLive_() { return cachedProp_('TESTLIVE'); }
function testRel_() { return cachedProp_('TESTREL'); }
function recKey_(sid, name) { return 'tl:' + sid + ':' + norm_(name); }
function parseDef_(s) { try { var d = typeof s === 'string' ? JSON.parse(s) : s; return d && typeof d === 'object' ? d : null; } catch (e) { return null; } }
function cleanDef_(d) {
  d = d || {};
  var items = (Array.isArray(d.items) ? d.items : []).slice(0, 80).map(function (x) { return { l: clean_(x && x.l, 20), i: clean_(x && x.i, 16) }; }).filter(function (x) { return x.l && x.i; });
  return { title: clean_(d.title || 'Test', 80) || 'Test', kind: d.kind === 'exit' ? 'exit' : 'test', minutes: Math.max(0, Math.min(240, Math.round(Number(d.minutes) || 0))),
    timing: ['period', 'minutes', 'none'].indexOf(d.timing) >= 0 ? d.timing : 'period',
    calc: d.calc !== false, shuffle: !!d.shuffle, levels: d.levels !== false, unit: Math.max(0, Math.min(20, Math.round(Number(d.unit) || 0))), items: items };
}
function sessionDef_(sid) {
  var c = cget_('tsdef:' + sid); if (c) return c;
  var rs = rows_('TestSessions'); for (var i = rs.length - 1; i >= 0; i--) if (rs[i][0] === sid) { var d = parseDef_(rs[i][8]); if (d) { cput_('tsdef:' + sid, d); return d; } }
  return null;
}
function liveKey_(klass, who) { return norm_(klass) + (who ? '|' + norm_(who) : ''); }
/* the live session for this student: a retest of their own first, else the class's */
function liveFor_(klass, name) { var all = testLive_(), l = name ? all[liveKey_(klass, name)] : null; if (l && l.id) return l; l = all[norm_(klass)]; return l && l.id ? l : null; }
function liveIs_(klass, name, sid) { var all = testLive_(), a = all[liveKey_(klass, name)], b = all[norm_(klass)]; return !!((a && a.id === sid) || (b && b.id === sid)); }

/* ---------------- student side ---------------- */
function tcheck_(p) {
  var who = authFast_(p['class'], p.name, p.token); if (!who) return { ok: false, error: 'badtoken' };
  var live = liveFor_(who.klass, who.name), rel = testRel_()[norm_(who.klass)] || 0, conf = {};
  String(p.pend || '').split(',').slice(0, 10).forEach(function (sid) { sid = clean_(sid, 40); if (!sid) return; var r = cget_(recKey_(sid, who.name)); if (r) conf[sid] = { st: r.st, rev: r.rev || 0, saved: !!r.saved }; });
  if (!live) return { ok: true, live: null, rel: rel, conf: conf, now: Date.now() };
  var def = sessionDef_(live.id), me = cget_(recKey_(live.id, who.name)), n = norm_(who.name);
  var out = { ok: true, now: Date.now(), rel: rel, conf: conf, live: { id: live.id, launched: live.launched, ending: !!live.ending, def: def, endsAt: live.endsAt || 0,
    extra: (Number((live.extra || {})['*']) || 0) + (Number((live.extra || {})[n]) || 0), unlock: Number((live.unlock || {})[n]) || 0, submit: Number((live.submit || {})[n]) || 0 } };
  if (me) { out.me = { st: me.st, dev: me.dev, used: me.used, unlockN: me.unlockN || 0, started: me.started, rev: me.rev || 0, saved: !!me.saved }; if (p.full) { out.me.ans = me.ans || {}; out.me.leaves = me.leaves || 0; out.me.order = me.order || null; } }
  return out;
}
function myResults_(p) {
  var who = authFast_(p['class'], p.name, p.token); if (!who) return { ok: false, error: 'badtoken' };
  var k = norm_(who.klass), n = norm_(who.name), sess = {};
  rows_('TestSessions').forEach(function (r) { if (norm_(r[2]) === k && r[7]) sess[r[0]] = { id: r[0], title: r[3], kind: r[4], launched: ms_(r[5]), released: ms_(r[7]), def: parseDef_(r[8]) }; });
  var out = [];
  rows_('TestResults').forEach(function (r) {
    var s = sess[r[1]]; if (!s || norm_(r[3]) !== n) return;
    var ans = {}; try { ans = JSON.parse(r[10] || '{}'); } catch (e) {}
    out.push({ id: s.id, title: s.title, kind: s.kind, launched: s.launched, released: s.released, def: s.def, status: r[4], answers: ans, marks: String(r[11] || ''), score: r[12], total: r[13] });
  });
  out.sort(function (a, b) { return b.launched - a.launched; });
  return { ok: true, results: out };
}
/* POST { kind:'test', class, name, token, device, session, st, cur, ans, used, leaves, started, unlockN, order, fs, final } */
function testPost_(body) {
  var who = authFast_(body['class'], body.name, body.token); if (!who) return { ok: false, error: 'badtoken' };
  var sid = clean_(body.session, 40); if (!sid) return { ok: false, error: 'no session' };
  var def = sessionDef_(sid); if (!def) return { ok: false, error: 'unknown session' };
  var st = ['writing', 'submitted', 'left', 'time', 'ended', 'forced'].indexOf(body.st) >= 0 ? body.st : 'writing';
  var now = Date.now(), key = recKey_(sid, who.name), prev = cget_(key) || {};
  if (prev.st && prev.st !== 'writing' && st === 'writing' && (Number(body.unlockN) || 0) <= (prev.unlockN || 0)) return { ok: false, error: 'closed' }; // finished and not unlocked since
  if (st !== 'writing' && prev.st && prev.st !== 'writing' && (Number(body.rev) || 0) < (prev.rev || 0)) return { ok: true, stale: true }; // an older copy of a final we already have
  if (st === 'writing' && !liveIs_(who.klass, who.name, sid)) return { ok: false, error: 'not live' };
  var ans = body.ans && typeof body.ans === 'object' ? body.ans : (prev.ans || {}), answered = 0;
  Object.keys(ans).forEach(function (k) { if (ans[k] && ans[k].t) answered++; });
  var rec = { st: st, cur: Number(body.cur) || 0, n: answered, ans: ans, used: Math.max(0, Number(body.used) || 0), leaves: Number(body.leaves) || 0, at: now, dev: clean_(body.device, 40),
    started: Number(body.started) || prev.started || now, unlockN: Number(body.unlockN) || 0, order: Array.isArray(body.order) ? body.order.slice(0, 80) : (prev.order || null), fs: !!body.fs,
    done: st === 'writing' ? 0 : (prev.done && prev.st === st ? prev.done : now), why: clean_(body.why, 40), rev: Number(body.rev) || 0, saved: false };
  if (st === 'writing') { cput_(key, rec); return { ok: true }; }
  // a final copy: write the sheet first, and only then tell the cache (and so the student's device) it is safe
  var lock = LockService.getScriptLock();
  try { lock.waitLock(25000); } catch (e) { rec.saved = false; cput_(key, rec); return { ok: false, error: 'busy' }; }
  try { upsertResult_(sid, who.klass, who.name, rec); rec.saved = true; } catch (e) { rec.saved = false; }
  finally { lock.releaseLock(); }
  cput_(key, rec);
  return { ok: rec.saved };
}
function ansJson_(ans) {
  var txt = JSON.stringify(ans); if (txt.length <= 48000) return txt;
  var slim = {}; Object.keys(ans).forEach(function (k) { slim[k] = { r: ans[k].r, h: ans[k].h }; }); txt = JSON.stringify(slim); if (txt.length <= 48000) return txt;
  var out = { __trunc: 1 }; Object.keys(slim).forEach(function (k) { var t = JSON.stringify(out); var add = JSON.stringify(slim[k]); if (t.length + add.length + k.length + 6 < 48000) out[k] = slim[k]; });
  return JSON.stringify(out);
}
function resultRow_(sid, name) {
  var sh = sheet_('TestResults'), key = sid + '|' + norm_(name), last = sh.getLastRow();
  if (last > 1) { var ks = sh.getRange(2, 1, last - 1, 5).getValues(); for (var i = ks.length - 1; i >= 0; i--) if (ks[i][0] === key) return { row: i + 2, st: ks[i][4] }; }
  return null;
}
function upsertResult_(sid, klass, name, rec) {
  var sh = sheet_('TestResults'), key = sid + '|' + norm_(name), last = sh.getLastRow(), row = 0;
  if (last > 1) { var ks = sh.getRange(2, 1, last - 1, 1).getValues(); for (var i = ks.length - 1; i >= 0; i--) if (ks[i][0] === key) { row = i + 2; break; } }
  var txt = ansJson_(rec.ans || {});
  var vals = [key, sid, klass, name, rec.st, rec.started ? new Date(rec.started) : '', rec.done ? new Date(rec.done) : '', Math.round((rec.used || 0) / 1000), rec.leaves || 0, rec.dev || '', txt];
  if (row) { sh.getRange(row, 1, 1, vals.length).setValues([vals]); sh.getRange(row, 15).setValue(new Date()); }
  else sh.getRange(sh.getLastRow() + 1, 1, 1, COLS.TestResults.length).setValues([vals.concat(['', '', '', new Date()])]);
}

/* ---------------- teacher side ---------------- */
function testsList_() {
  return { ok: true, tests: rows_('Tests').map(function (r) { return { id: r[0], title: r[1], kind: r[2], updated: ms_(r[3]), def: parseDef_(r[4]) }; }), live: testLive_() };
}
function saveTest_(id, defJson) {
  var def = cleanDef_(parseDef_(defJson)); if (!def.items.length) return { ok: false, error: 'no questions' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_('Tests'), rs = rows_('Tests'), row = 0;
    id = clean_(id, 30); if (id) rs.forEach(function (r, i) { if (r[0] === id) row = i + 2; }); else id = 'T' + Date.now().toString(36);
    var vals = [id, def.title, def.kind, new Date(), JSON.stringify(def)];
    if (row) sh.getRange(row, 1, 1, vals.length).setValues([vals]); else sh.getRange(sh.getLastRow() + 1, 1, 1, vals.length).setValues([vals]);
    return { ok: true, id: id, def: def };
  } finally { lock.releaseLock(); }
}
function delTest_(id) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { var sh = sheet_('Tests'), rs = rows_('Tests'); for (var i = rs.length - 1; i >= 0; i--) if (rs[i][0] === id) sh.deleteRow(i + 2); return { ok: true }; }
  finally { lock.releaseLock(); }
}
function launch_(klass, testId, who) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var t = null; rows_('Tests').forEach(function (r) { if (r[0] === testId) t = { id: r[0], def: parseDef_(r[4]) }; });
  if (!t || !t.def) return { ok: false, error: 'unknown test' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var lk = who ? liveKey_(c.code, who) : c.code;
    var all = list_('TESTLIVE') || {}; if (all[lk] && all[lk].id) return { ok: false, error: 'live', live: all[lk] };
    var sid = 'S' + Date.now().toString(36), now = Date.now();
    sheet_('TestSessions').appendRow([sid, t.id, c.code, t.def.title, t.def.kind, new Date(now), '', '', JSON.stringify(t.def), who || '']);
    cput_('tsdef:' + sid, t.def);
    all[lk] = { id: sid, test: t.id, title: t.def.title, kind: t.def.kind, launched: now, ending: false, extra: {}, unlock: {}, submit: {} };
    // "until the end of class" (the default): the end of the class period that's on now; none outside class time
    if ((t.def.timing || 'period') === 'period') all[lk].endsAt = periodEnd_(blockFor_(c.code), noSchool_(), now);
    if (who) all[lk].who = who;
    saveProp_('TESTLIVE', all);
    return { ok: true, live: all[lk] };
  } finally { lock.releaseLock(); }
}
function tlive_(klass, who) {
  var live = who ? testLive_()[liveKey_(klass, who)] : liveFor_(klass), names = rosterRows_(klass).map(function (x) { return String(x.v[1]); });
  if (live && !live.id) live = null;
  if (who) names = names.filter(function (n) { return norm_(n) === norm_(who); });
  if (!live) return { ok: true, live: null, names: names, now: Date.now() };
  var keys = names.map(function (n) { return recKey_(live.id, n); }), got = {};
  try { got = cache_().getAll(keys) || {}; } catch (e) { got = {}; }
  var recs = {}; names.forEach(function (n, i) { var v = got[keys[i]]; if (v) { try { recs[n] = JSON.parse(v); } catch (e) {} } });
  return { ok: true, live: live, def: sessionDef_(live.id), recs: recs, names: names, now: Date.now() };
}
/* op: unlock | time | submit | end | close | resume (cancel end) */
function tctl_(klass, op, name, mins, who) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var all = list_('TESTLIVE') || {}, k = liveKey_(klass, who), live = all[k]; if (!live) return { ok: false, error: 'no live test' };
    var n = norm_(name || ''); live.extra = live.extra || {}; live.unlock = live.unlock || {}; live.submit = live.submit || {};
    if (op === 'unlock') { if (!n) return { ok: false, error: 'no student' }; live.unlock[n] = (live.unlock[n] || 0) + 1; if (Number(mins)) live.extra[n] = (live.extra[n] || 0) + Number(mins); }
    else if (op === 'time') live.extra[n || '*'] = (live.extra[n || '*'] || 0) + (Number(mins) || 0);
    else if (op === 'submit') {
      if (!n) return { ok: false, error: 'no student' }; live.submit[n] = (live.submit[n] || 0) + 1;
      var who2 = findStudent_(klass, name), rk = who2 ? recKey_(live.id, who2.v[1]) : '', rc = rk ? cget_(rk) : null;
      if (rc && rc.st === 'writing') { rc.st = 'forced'; rc.why = 'submitted by the teacher'; rc.done = Date.now(); rc.rev = (rc.rev || 0) + 1; upsertResult_(live.id, String(who2.v[0]), String(who2.v[1]), rc); rc.saved = true; cput_(rk, rc); }
    }
    else if (op === 'end') live.ending = true;
    else if (op === 'resume') live.ending = false;
    else if (op === 'close') {
      delete all[k]; saveProp_('TESTLIVE', all);
      var sh = sheet_('TestSessions'), rs = rows_('TestSessions');
      for (var i = rs.length - 1; i >= 0; i--) if (rs[i][0] === live.id) { sh.getRange(i + 2, 7).setValue(new Date()); break; }
      if (who) retestsDone_(live.id);
      // anyone still writing when the test is closed: keep what the cache has (they were told to stop)
      rosterRows_(klass).forEach(function (x) {
        if (who && norm_(x.v[1]) !== norm_(who)) return;
        var rk = recKey_(live.id, x.v[1]), rec = cget_(rk); if (!rec) return;
        if (rec.st === 'writing') { var have = resultRow_(live.id, x.v[1]); if (have && have.st && have.st !== 'writing') return; rec.st = 'ended'; rec.done = Date.now(); }
        else if (rec.saved) return;
        upsertResult_(live.id, String(x.v[0]), String(x.v[1]), rec); rec.saved = true; cput_(rk, rec);
      });
      return { ok: true, closed: live.id };
    } else return { ok: false, error: 'bad op' };
    all[k] = live; saveProp_('TESTLIVE', all);
    return { ok: true, live: live };
  } finally { lock.releaseLock(); }
}
function sessions_(klass) {
  var k = norm_(klass), counts = {};
  rows_('TestResults').forEach(function (r) { if (norm_(r[2]) === k) counts[r[1]] = (counts[r[1]] || 0) + 1; });
  return { ok: true, sessions: rows_('TestSessions').filter(function (r) { return norm_(r[2]) === k; }).map(function (r) {
    return { id: r[0], test: r[1], title: r[3], kind: r[4], launched: ms_(r[5]), closed: ms_(r[6]), released: ms_(r[7]), results: counts[r[0]] || 0, student: String(r[9] || '') }; }).reverse() };
}
function tresults_(sid) {
  var s = null; rows_('TestSessions').forEach(function (r) { if (r[0] === sid) s = { id: r[0], test: r[1], 'class': r[2], title: r[3], kind: r[4], launched: ms_(r[5]), closed: ms_(r[6]), released: ms_(r[7]), def: parseDef_(r[8]), student: String(r[9] || '') }; });
  if (!s) return { ok: false, error: 'unknown session' };
  var rows = rows_('TestResults').filter(function (r) { return r[1] === sid; }).map(function (r) {
    var ans = {}; try { ans = JSON.parse(r[10] || '{}'); } catch (e) {}
    return { name: r[3], status: r[4], started: ms_(r[5]), submitted: ms_(r[6]), used: Number(r[7]) || 0, leaves: Number(r[8]) || 0, device: r[9], answers: ans, marks: String(r[11] || ''), score: r[12], total: r[13] };
  });
  var names = rosterRows_(s['class']).map(function (x) { return String(x.v[1]); });
  if (s.student) names = names.filter(function (n) { return norm_(n) === norm_(s.student); });
  return { ok: true, session: s, rows: rows, names: names };
}
/* data = { name: { m: 'cwfb…' (one letter per question, upper case = teacher override), s: score, t: total } } */
function setMarks_(sid, data) {
  var d = parseDef_(data) || {}, lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_('TestResults'), rs = rows_('TestResults'), n = 0;
    rs.forEach(function (r, i) { if (r[1] !== sid) return; var x = d[r[3]]; if (!x) return; sh.getRange(i + 2, 12, 1, 4).setValues([[clean_(x.m, 600), Number(x.s) || 0, Number(x.t) || 0, new Date()]]); n++; });
    return { ok: true, saved: n };
  } finally { lock.releaseLock(); }
}
function release_(sid, on) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = sheet_('TestSessions'), rs = rows_('TestSessions'), klass = '';
    for (var i = rs.length - 1; i >= 0; i--) if (rs[i][0] === sid) { sh.getRange(i + 2, 8).setValue(on ? new Date() : ''); klass = norm_(rs[i][2]); break; }
    if (!klass) return { ok: false, error: 'unknown session' };
    var rel = list_('TESTREL') || {}; rel[klass] = (rel[klass] || 0) + 1; saveProp_('TESTREL', rel);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ============================================================
 * RETESTS
 * When a student has done every required question in a unit without seeing a solution (and, after a retest, every
 * extra practice question too), the practice site lets them request a retest. Requests show in the Teacher Ledger's
 * Retests tab; the teacher launches a test for that one student (launch_ with who), and closing it marks the
 * request written.
 *   Retests   id, class, name, unit, requested, status (requested | open | done | dismissed | cancelled), session,
 *             updated, test, info (what the student's device reported: required / extra counts)
 * ============================================================ */
COLS.Retests = ['id', 'class', 'name', 'unit', 'requested', 'status', 'session', 'updated', 'test', 'info'];
function retestRows_() { return rows_('Retests').map(function (r, i) { return { row: i + 2, id: String(r[0]), klass: String(r[1]), name: String(r[2]), unit: Number(r[3]) || 0, requested: ms_(r[4]), status: String(r[5]), session: String(r[6] || ''), updated: ms_(r[7]), test: String(r[8] || ''), info: String(r[9] || '') }; }); }
function retestOut_(x) { return { id: x.id, name: x.name, unit: x.unit, requested: x.requested, status: x.status, session: x.session, updated: x.updated, test: x.test, info: x.info }; }
function myRetests_(p) {
  var who = authFast_(p['class'], p.name, p.token); if (!who) return { ok: false, error: 'badtoken' };
  var k = norm_(who.klass), n = norm_(who.name);
  return { ok: true, retests: retestRows_().filter(function (x) { return norm_(x.klass) === k && norm_(x.name) === n; }).map(retestOut_) };
}
/* ?action=reqretest&class&name&token&unit[&cancel=1][&info=…] */
function reqRetest_(p) {
  var who = authFast_(p['class'], p.name, p.token); if (!who) return { ok: false, error: 'badtoken' };
  var unit = Math.round(Number(p.unit) || 0); if (unit < 1 || unit > 20) return { ok: false, error: 'bad unit' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var k = norm_(who.klass), n = norm_(who.name), sh = sheet_('Retests'), now = new Date();
    var mine = retestRows_().filter(function (x) { return norm_(x.klass) === k && norm_(x.name) === n && x.unit === unit; });
    var active = mine.filter(function (x) { return x.status === 'requested' || x.status === 'open'; })[0];
    if (p.cancel === '1') {
      if (!active || active.status !== 'requested') return { ok: false, error: 'nothing to cancel' };
      sh.getRange(active.row, 6, 1, 3).setValues([['cancelled', '', now]]);
    } else {
      if (active) return { ok: true, already: true, retests: myRetests_(p).retests };
      sh.appendRow(['R' + Date.now().toString(36), who.klass, who.name, unit, now, 'requested', '', now, '', clean_(p.info, 200)]);
    }
    return { ok: true, retests: myRetests_(p).retests };
  } finally { lock.releaseLock(); }
}
/* the Retests tab: every request for the class, and the finished tests of each requesting student (to show grades) */
function retests_(klass) {
  var c = classOf_(klass); if (!c) return { ok: false, error: 'unknown class' };
  var k = norm_(c.code), list = retestRows_().filter(function (x) { return norm_(x.klass) === k; }), names = {};
  list.forEach(function (x) { names[norm_(x.name)] = 1; });
  var sess = {}; rows_('TestSessions').forEach(function (r) { if (norm_(r[2]) === k && r[4] !== 'exit') sess[r[0]] = { id: r[0], test: r[1], title: r[3], launched: ms_(r[5]), closed: ms_(r[6]), released: ms_(r[7]), def: parseDef_(r[8]), student: String(r[9] || '') }; });
  var results = [];
  rows_('TestResults').forEach(function (r) {
    var s = sess[r[1]]; if (!s || !names[norm_(r[3])]) return;
    results.push({ session: s.id, name: String(r[3]), status: r[4], marks: String(r[11] || ''), score: r[12], total: r[13] });
  });
  var used = {}; results.forEach(function (x) { used[x.session] = 1; });
  return { ok: true, retests: list.map(retestOut_), results: results, sessions: Object.keys(used).map(function (id) { return sess[id]; }), live: testLive_() };
}
function retestSet_(id, status) {
  if (['dismissed', 'requested', 'done'].indexOf(status) < 0) return { ok: false, error: 'bad status' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var x = retestRows_().filter(function (r) { return r.id === id; })[0]; if (!x) return { ok: false, error: 'unknown request' };
    sheet_('Retests').getRange(x.row, 6, 1, 3).setValues([[status, status === 'requested' ? '' : x.session, new Date()]]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function launchRetest_(id, testId) {
  var x = retestRows_().filter(function (r) { return r.id === id; })[0]; if (!x) return { ok: false, error: 'unknown request' };
  if (x.status !== 'requested') return { ok: false, error: 'not requested' };
  var d = launch_(x.klass, testId, x.name); if (!d.ok) return d;
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { sheet_('Retests').getRange(x.row, 6, 1, 4).setValues([['open', d.live.id, new Date(), clean_(testId, 30)]]); } finally { lock.releaseLock(); }
  return d;
}
/* the retest written in this session (called from tctl_ close, inside its lock) */
function retestsDone_(sid) {
  var sh = sheet_('Retests');
  retestRows_().forEach(function (x) { if (x.session === sid && x.status === 'open') sh.getRange(x.row, 6, 1, 3).setValues([['done', sid, new Date()]]); });
}
