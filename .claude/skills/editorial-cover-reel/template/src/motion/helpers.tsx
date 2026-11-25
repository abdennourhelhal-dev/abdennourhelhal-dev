import React from 'react';
import { Easing } from 'remotion';

// Everything is a pure function of a (possibly fractional) local frame, so the
// accumulation motion blur below can sample sub-frames. No opacity animation anywhere.
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Damped spring 0 -> 1 with overshoot. w = angular freq (rad/frame), z = damping ratio. */
export const osc = (f: number, w = 0.55, z = 0.4) => {
  if (f <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * f) * (Math.cos(wd * f) + ((z * w) / wd) * Math.sin(wd * f));
};

export const easeOut = Easing.bezier(0.16, 0.84, 0.2, 1); // expo-ish out
export const easeIn = Easing.bezier(0.55, 0, 0.8, 0.2);
export const easeInOut = Easing.bezier(0.83, 0, 0.17, 1); // page moves
export const snapEase = Easing.bezier(0.7, 0, 0.15, 1);
export const calmEase = Easing.bezier(0.25, 1, 0.5, 1); // soft ease-out, no overshoot

export const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(',')})`;

/**
 * Sub-frame motion blur: averages `samples` renders over a 180° shutter, additively
 * (plus-lighter in an isolated group = true average). The per-sample opacity is an
 * accumulation weight, not a fade. Only switch it on while something moves fast.
 */
export const Accum: React.FC<{
  f: number; active: boolean; render: (f: number) => React.ReactNode; samples?: number; shutter?: number;
}> = ({ f, active, render, samples = 10, shutter = 0.5 }) => {
  if (!active) return <>{render(f)}</>;
  return (
    <div style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
      {Array.from({ length: samples }, (_, j) => (
        <div key={j} style={{ position: 'absolute', inset: 0, opacity: 1 / samples /* blur-accumulation */, mixBlendMode: 'plus-lighter' }}>
          {render(f - (j * shutter) / samples)}
        </div>
      ))}
    </div>
  );
};
