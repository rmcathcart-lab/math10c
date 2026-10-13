/* Math 10C Teaching — shared lesson ink.
 *
 * Stores the teacher's Apple Pencil notes so students' devices can show them live (view only).
 * One tab per lesson and class ("ink u1l1 B"): row 1 holds the epoch (changes when the notes are cleared),
 * each row after it holds one change as JSON — a stroke added, strokes erased, or everything cleared.
 *
 * Setup (once):
 *   1. Make a new Google Sheet ("Math 10C Teaching Ink") → Extensions → Apps Script → paste this file.
 *   2. Run setup() once and allow access. The Execution log shows your teacher key.
 *   3. Deploy → New deployment → Web app: Execute as "Me", Who has access "Anyone". Copy the /exec URL.
 *
 * API
 *   GET  ?op=poll&lesson=u1l1&cls=B&epoch=<e>&since=<row>  → { ok, epoch, last, more, full, ops: [json, …] }
 *   POST text/plain { op: 'push',  key, lesson, cls, ops: [...] } → { ok, epoch, last }
 *   POST text/plain { op: 'check', key }                          → { ok }
 */

var MAX_ROWS_PER_POLL = 300;

function setup() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('TEACHER_KEY');
  if (!key) {
    var abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; key = '';
    for (var i = 0; i < 6; i++) key += abc.charAt(Math.floor(Math.random() * abc.length));
    props.setProperty('TEACHER_KEY', key);
  }
  props.setProperty('SHEET_ID', SpreadsheetApp.getActiveSpreadsheet().getId());
  Logger.log('Your teacher key is: ' + key + '   (change it any time under Project Settings → Script properties)');
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function book_() { var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID'); return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet(); }
function tabName_(lesson, cls) {
  lesson = String(lesson || ''); cls = String(cls || '');
  if (!/^[a-z0-9]{1,16}$/.test(lesson) || !/^[A-Za-z0-9-]{1,16}$/.test(cls)) throw new Error('bad lesson or class');
  return 'ink ' + lesson + ' ' + cls.toUpperCase();
}
function keyOk_(key) { var k = PropertiesService.getScriptProperties().getProperty('TEACHER_KEY'); return !!k && String(key || '').trim().toUpperCase() === k.toUpperCase(); }
function epochOf_(sh) { try { return JSON.parse(sh.getRange(1, 1).getValue()).epoch || 0; } catch (e) { return 0; } }
function remember_(name, epoch, last) { CacheService.getScriptCache().put(name, epoch + ':' + last, 21600); }

function doGet(e) {
  var p = e.parameter || {};
  try {
    if (p.op === 'poll') return out_(poll_(p));
    return out_({ ok: true, service: 'Math 10C Teaching ink' });
  } catch (err) { return out_({ ok: false, error: String(err.message || err) }); }
}

function poll_(p) {
  var name = tabName_(p.lesson, p.cls), since = Math.max(1, Number(p.since) || 1);
  // Fast path: nothing new since the last change was cached.
  var c = CacheService.getScriptCache().get(name);
  if (c) {
    var parts = c.split(':');
    if (parts[0] === String(p.epoch) && Number(parts[1]) <= since) return { ok: true, epoch: Number(parts[0]), last: since, more: false, full: false, ops: [] };
  }
  var sh = book_().getSheetByName(name);
  if (!sh) return { ok: true, epoch: 0, last: 1, more: false, full: String(p.epoch) !== '0', ops: [] };
  var epoch = epochOf_(sh), lastRow = Math.max(1, sh.getLastRow()), full = String(epoch) !== String(p.epoch);
  remember_(name, epoch, lastRow);
  if (full) since = 1;
  var to = Math.min(lastRow, since + MAX_ROWS_PER_POLL), ops = [];
  if (to > since) ops = sh.getRange(since + 1, 1, to - since, 1).getValues().map(function (r) { return r[0]; }).filter(String);
  return { ok: true, epoch: epoch, last: to, more: to < lastRow, full: full, ops: ops };
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad request' }); }
  if (!keyOk_(body.key)) return out_({ ok: false, error: 'badkey' });
  if (body.op === 'check') return out_({ ok: true });
  if (body.op !== 'push') return out_({ ok: false, error: 'unknown op' });
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var name = tabName_(body.lesson, body.cls), book = book_(), sh = book.getSheetByName(name);
    if (!sh) { sh = book.insertSheet(name); sh.getRange(1, 1).setValue(JSON.stringify({ epoch: Date.now() })); }
    var rows = [];
    (body.ops || []).forEach(function (op) {
      if (op && op.a === 'reset') {
        rows = [];
        sh.clearContents(); sh.getRange(1, 1).setValue(JSON.stringify({ epoch: Date.now() }));
      } else if (op && (op.a === 'add' || op.a === 'del')) {
        var j = JSON.stringify(op); if (j.length < 49000) rows.push([j]);
      }
    });
    var last = Math.max(1, sh.getLastRow());
    if (rows.length) { sh.getRange(last + 1, 1, rows.length, 1).setValues(rows); last += rows.length; }
    var epoch = epochOf_(sh);
    remember_(name, epoch, last);
    return out_({ ok: true, epoch: epoch, last: last });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  } finally { lock.releaseLock(); }
}
