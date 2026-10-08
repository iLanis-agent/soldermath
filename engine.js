/* Solder math engine.
   Exact alloy specs (published melting ranges) plus labeled bench guidance
   (iron setpoints, wattage by thermal mass). The dial is not the joint. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Soldermath = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  // Exact spec: published melting ranges (C). Eutectics melt at one point.
  const ALLOYS = {
    sn63pb37:  { label: '63/37 leaded',        mpLow: 183, mpHigh: 183, eutectic: true,  note: 'the forgiving classic - flows clean, freezes fast' },
    sn60pb40:  { label: '60/40 leaded',        mpLow: 183, mpHigh: 190, eutectic: false, note: 'slight pasty range - keep the joint still' },
    sac305:    { label: 'SAC305 lead-free',    mpLow: 217, mpHigh: 219, eutectic: false, note: 'the lead-free default - needs honest heat' },
    sn99cu07:  { label: '99.3Sn 0.7Cu',        mpLow: 227, mpHigh: 227, eutectic: true,  note: 'cheap lead-free - runs the hottest of the common ones' },
    sn42bi58:  { label: '42Sn 58Bi low-temp',  mpLow: 138, mpHigh: 138, eutectic: true,  note: 'low-temp bismuth - kind to sensitive parts, brittle joints' },
    sn57bi43:  { label: '57Sn 43Bi low-temp',  mpLow: 139, mpHigh: 139, eutectic: true,  note: 'bismuth low-temp - watch for lead contamination' },
    sn91zn9:   { label: '91Sn 9Zn',            mpLow: 199, mpHigh: 199, eutectic: true,  note: 'zinc alloy - corrosive residue, clean it' },
    pb93sn5ag: { label: 'high-Pb 93.5/5/1.5',  mpLow: 296, mpHigh: 301, eutectic: false, note: 'high-temp for step soldering - plan the order' }
  };
  // Labeled bench guidance: thermal-mass classes (milli-factor, integer math).
  const JOINTS = {
    smd:      { label: 'small SMD pad',      fMilli: 1000, watts: 25, note: 'a fine tip and a steady hand' },
    through:  { label: 'through-hole pin',   fMilli: 1300, watts: 40, note: 'the bread-and-butter joint' },
    splice:   { label: 'wire splice',        fMilli: 1600, watts: 50, note: 'heat the wire, not the solder' },
    bigconn:  { label: 'large connector',    fMilli: 2200, watts: 60, note: 'big lugs drink heat' },
    plane:    { label: 'ground plane tab',   fMilli: 3000, watts: 80, note: 'the plane eats watts, not degrees - more iron, not more dial' }
  };
  const BASE_RISE = 100;   // labeled: setpoint = liquidus + 100C for a light joint
  const CLASS_STEP = 40;   // labeled: extra setpoint per thermal-mass step
  const WIN_LO = 40;       // labeled: window floor above liquidus
  const WIN_HI = 160;      // labeled: window ceiling above liquidus

  function alloyInfo(key) {
    const a = ALLOYS[key];
    if (!a) throw new Error('unknown alloy');
    return { mpLow: a.mpLow, mpHigh: a.mpHigh, eutectic: a.eutectic, note: a.note };
  }

  function jointInfo(key) {
    const j = JOINTS[key];
    if (!j) throw new Error('unknown joint');
    return { delta: (j.fMilli - 1000) * CLASS_STEP / 1000, watts: j.watts, note: j.note };
  }

  function suggestSetup(alloyKey, jointKey) {
    const a = alloyInfo(alloyKey);
    const j = jointInfo(jointKey);
    const liquidus = a.mpHigh;
    const setpoint = liquidus + BASE_RISE + j.delta;
    const winLo = liquidus + WIN_LO + j.delta;
    const winHi = liquidus + WIN_HI + j.delta;
    return { liquidus: liquidus, setpoint: setpoint, watts: j.watts, winLo: winLo, winHi: winHi, note: j.note };
  }

  function checkJoint(alloyKey, jointKey, ironTemp) {
    const s = suggestSetup(alloyKey, jointKey);
    if (typeof ironTemp !== 'number' || !isFinite(ironTemp)) throw new Error('iron temp must be a number');
    if (ironTemp <= 0) throw new Error('iron temp must be positive');
    let verdict;
    if (ironTemp < s.winLo) verdict = 'cold-joint risk - the joint freezes before it flows (labeled)';
    else if (ironTemp <= s.winHi) verdict = 'in the working window (labeled guidance)';
    else verdict = 'running hot - pads, parts and tips pay for it (labeled)';
    return {
      liquidus: s.liquidus,
      setpoint: s.setpoint,
      margin: ironTemp - s.setpoint,
      winLo: s.winLo,
      winHi: s.winHi,
      verdict: verdict
    };
  }

  return { alloyInfo: alloyInfo, jointInfo: jointInfo, suggestSetup: suggestSetup, checkJoint: checkJoint, alloys: ALLOYS, joints: JOINTS };
});
