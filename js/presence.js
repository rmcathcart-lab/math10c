/* On a lesson page (lessons/…): a student signed in on the practice site shows in the Teacher Ledger's Live tab as
 * "On the lesson page". Loaded by lessons/js/ui.js after config.js and ledger.js; it only reports where the student is
 * (no answers, nothing saved). The teacher's own iPad never loads it. */
(function (root) {
  'use strict';
  var HW = root.HW || {}, L = HW.Ledger, info = root.HW_PRESENCE || {};
  if (!L || !L.enabled) return;
  var sess = null; try { sess = JSON.parse(localStorage.getItem('hw:session') || 'null'); } catch (e) { sess = null; }
  if (!sess || !sess.token) return;
  var dev = ''; try { dev = localStorage.getItem('hw:device') || ''; } catch (e) {}
  L.session = { klass: sess.klass, name: sess.name, token: sess.token, device: dev };
  var since = Date.now();
  function report(away) { L.setStatus({ view: 'teach', lesson: info.lesson || '', label: info.label || '', away: !!away, at: since }, true); }
  report(document.visibilityState === 'hidden');
  L.start();
  document.addEventListener('visibilitychange', function () { var h = document.visibilityState === 'hidden'; report(h); if (h) L.flush(true); });
})(window);
