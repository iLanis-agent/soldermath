const M = require('./engine.js');
const cases = require('./expected.json').cases;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) pass++; else { fail++; console.log('FAIL:', label); } }
function eqObj(a, b, label) {
  const ka = Object.keys(a), kb = Object.keys(b);
  ok(ka.length === kb.length, label + ' key count');
  for (const k of ka) {
    const va = a[k], vb = b[k];
    if (typeof va === 'number' && typeof vb === 'number') ok(va === vb, label + '.' + k + ' ' + va + ' vs ' + vb);
    else ok(va === vb, label + '.' + k + ' ' + JSON.stringify(va) + ' vs ' + JSON.stringify(vb));
  }
}
for (const c of cases) eqObj(M[c.kind](...c.args), c.out, c.kind + '(' + c.args.join(',') + ')');
// anchors
ok(M.alloyInfo('sn63pb37').mpLow === 183 && M.alloyInfo('sn63pb37').eutectic === true, 'anchor 63/37 eutectic 183');
ok(M.alloyInfo('sac305').mpHigh === 219, 'anchor SAC305 liquidus 219');
const s1 = M.suggestSetup('sn63pb37', 'smd');
ok(s1.setpoint === 283 && s1.winLo === 223 && s1.winHi === 343 && s1.watts === 25, 'anchor sn63 smd setup');
const c1 = M.checkJoint('sn63pb37', 'smd', 283);
ok(c1.margin === 0 && c1.verdict === 'in the working window (labeled guidance)', 'anchor window at setpoint');
// properties: heavier joint needs more heat and watts; lead-free hotter than leaded
ok(M.suggestSetup('sn63pb37', 'plane').setpoint > M.suggestSetup('sn63pb37', 'smd').setpoint, 'plane hotter than smd');
ok(M.suggestSetup('sn63pb37', 'plane').watts > M.suggestSetup('sn63pb37', 'smd').watts, 'plane more watts');
ok(M.suggestSetup('sac305', 'through').setpoint > M.suggestSetup('sn63pb37', 'through').setpoint, 'lead-free hotter');
// low-temp bismuth: a leaded-classic setpoint runs hot on it
ok(M.checkJoint('sn42bi58', 'smd', 320).verdict.startsWith('running hot'), 'bismuth runs hot at 320');
// errors
function throws(fn, msg) { try { fn(); return false; } catch (e) { return e.message === msg; } }
ok(throws(() => M.alloyInfo('unobtanium'), 'unknown alloy'), 'bad alloy');
ok(throws(() => M.suggestSetup('sn63pb37', 'hose'), 'unknown joint'), 'bad joint');
ok(throws(() => M.checkJoint('sn63pb37', 'smd', NaN), 'iron temp must be a number'), 'temp NaN');
ok(throws(() => M.checkJoint('sn63pb37', 'smd', 0), 'iron temp must be positive'), 'temp zero');
ok(throws(() => M.checkJoint('sn63pb37', 'smd', -40), 'iron temp must be positive'), 'temp negative');
console.log(pass + '/' + (pass + fail) + ' checks pass');
process.exit(fail ? 1 : 0);
