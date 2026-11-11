export interface Vec2 {
  x: number;
  y: number;
}

export interface SpringState {
  value: number;
  velocity: number;
}

export interface StemSolveResult {
  pathD: string;
  tipX: number;
  tipY: number;
  tipAngleDeg: number;
  leafX: number;
  leafY: number;
  leafAngleDeg: number;
}

/**
 * Evaluates a non-repetitive traveling spatial wind field across normalized screen coords [0..1].
 * Returns signed normalized horizontal wind deflection around [-1.35, 1.35].
 */
export function sampleWindField(xNorm: number, yNorm: number, timeSec: number, gustPhase = 0): number {
  // Traveling horizontal wind front moving across the meadow
  const wavePhase = timeSec * 0.86 - xNorm * 1.55 - yNorm * 0.36 + gustPhase;

  // Slow irrational-frequency gust envelope (calm moments alternating with gentle surges)
  const envelope =
    0.68 +
    0.34 * Math.sin(timeSec * 0.24 + 0.7) +
    0.26 * Math.sin(timeSec * 0.41 - xNorm * 0.8 + 2.1);

  const primarySway = Math.sin(wavePhase) * 0.74;
  const crossFlutter = Math.sin(wavePhase * 1.93 + 1.1) * 0.24;
  const microDrift = Math.sin(timeSec * 2.47 + xNorm * 4.3 + yNorm * 2.7) * 0.09;

  // Occasional slow directional reversal offset
  const directionBias = 0.22 * Math.sin(timeSec * 0.17 + 0.4);

  return (primarySway + crossFlutter + microDrift) * envelope + directionBias;
}

/** Smooth non-harmonic breathing oscillator in [0..1] for glowing aura & rim light */
export function sampleLightBreath(timeSec: number, seed: number): number {
  const s1 = Math.sin(timeSec * 0.47 + seed * 1.7);
  const s2 = Math.sin(timeSec * 0.23 + seed * 3.1 + 1.2);
  const combined = 0.5 + 0.32 * s1 + 0.18 * s2;

  return combined < 0 ? 0 : combined > 1 ? 1 : combined;
}

/** Semi-implicit spring step for lagged secondary skeletal joints (flower calyx & leaves) */
export function stepJointSpring(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): void {
  const clampedDt = Math.min(dt, 0.04);
  const force = (target - state.value) * stiffness;

  state.velocity = (state.velocity + force * clampedDt) * Math.exp(-damping * clampedDt);
  state.value += state.velocity * clampedDt;
}

/**
 * Evaluates a cubic Bezier spline representing a flexing botanical stem anchored at root,
 * preserving approximate stem length as its tip deflects laterally in the wind.
 */
export function solveCurvedStem(
  rootX: number,
  rootY: number,
  restTipX: number,
  restTipY: number,
  restCtrl1: Vec2,
  restCtrl2: Vec2,
  windDeflectPx: number,
  leafFrac = 0.46,
): StemSolveResult {
  const dx = windDeflectPx;
  const spanX = restTipX - rootX;
  const spanY = restTipY - rootY;
  const approxLen = Math.hypot(spanX, spanY) + 1;

  // Preserve arc length vertically/laterally so stems arc rather than stretch
  const dirSignY = spanY <= 0 ? 1 : -1;
  const arcDrop = ((dx * dx) / (2 * approxLen)) * 0.55 * dirSignY;

  const p1x = restCtrl1.x + dx * 0.18;
  const p1y = restCtrl1.y + arcDrop * 0.18;
  const p2x = restCtrl2.x + dx * 0.64;
  const p2y = restCtrl2.y + arcDrop * 0.64;
  const tipX = restTipX + dx;
  const tipY = restTipY + arcDrop;

  // Tangent right at rest vs deflected tip
  const restTan = Math.atan2(restTipY - restCtrl2.y, restTipX - restCtrl2.x);
  const liveTan = Math.atan2(tipY - p2y, tipX - p2x);
  const tipAngleDeg = ((liveTan - restTan) * 180) / Math.PI;

  // Evaluate leaf mount point on the Bezier curve at `t = leafFrac`
  const t = leafFrac;
  const u = 1 - t;
  const u2 = u * u;
  const t2 = t * t;

  const leafX = u2 * u * rootX + 3 * u2 * t * p1x + 3 * u * t2 * p2x + t2 * t * tipX;
  const leafY = u2 * u * rootY + 3 * u2 * t * p1y + 3 * u * t2 * p2y + t2 * t * tipY;

  const dxdt =
    3 * u2 * (p1x - rootX) + 6 * u * t * (p2x - p1x) + 3 * t2 * (tipX - p2x);

  const dydt =
    3 * u2 * (p1y - rootY) + 6 * u * t * (p2y - p1y) + 3 * t2 * (tipY - p2y);

  const liveLeafTan = Math.atan2(dydt, dxdt);

  const restDxdt =
    3 * u2 * (restCtrl1.x - rootX) +
    6 * u * t * (restCtrl2.x - restCtrl1.x) +
    3 * t2 * (restTipX - restCtrl2.x);

  const restDydt =
    3 * u2 * (restCtrl1.y - rootY) +
    6 * u * t * (restCtrl2.y - restCtrl1.y) +
    3 * t2 * (restTipY - restCtrl2.y);

  const restLeafTan = Math.atan2(restDydt, restDxdt);
  const leafAngleDeg = ((liveLeafTan - restLeafTan) * 180) / Math.PI;

  const pathD = `M ${rootX.toFixed(1)} ${rootY.toFixed(1)} C ${p1x.toFixed(1)} ${p1y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;

  return {
    pathD,
    tipX,
    tipY,
    tipAngleDeg,
    leafX,
    leafY,
    leafAngleDeg,
  };
}
