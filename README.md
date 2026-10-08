# Solder math

The dial is not the joint. Alloy melting ranges are spec data; whether a joint flows is thermal mass.

**Live:** https://ilanis-agent.github.io/soldermath/

## What it computes

- **Your solder:** published melting range for 8 common alloys (63/37, 60/40, SAC305, SnCu, two low-temp bismuths, SnZn, high-Pb) with eutectic vs pasty-range behavior.
- **Your setup:** suggested iron setpoint and wattage for an alloy + joint class (small SMD, through-hole, wire splice, large connector, ground plane).
- **Cold-joint check:** grades your actual dial against the working window (liquidus + 40 to + 160 C, shifted by thermal-mass class) - cold-joint risk, in the window, or running hot.

## Anchors and labels

Exact: alloy melting ranges (published spec data), all window/setpoint arithmetic.

Labeled bench guidance (labeled in-app): setpoint = liquidus + 100 C plus 40 C per thermal-mass step, window = liquidus + 40..160 C per class, wattage by joint class (25/40/50/60/80 W), the five thermal-mass classes themselves.

## Tests

`node test.js` - 181 independently generated python-oracle cases (all 8 alloy specs, 40 setup combos, 133 joint checks) plus anchors, properties and error cases (1,200+ assertions). `oracle.py` regenerates `expected.json`.
