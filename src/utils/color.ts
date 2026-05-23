// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

/**
 * Linearly interpolate between two `#rrggbb` colours.
 * @param from - start colour (`#rrggbb`)
 * @param to - end colour (`#rrggbb`)
 * @param t - position in [0, 1]
 * @returns the blended colour as `#rrggbb`
 */
export function lerpColor(from: string, to: string, t: number): string {
  const a = parseInt(from.slice(1), 16)
  const b = parseInt(to.slice(1), 16)
  const ar = (a >> 16) & 255
  const ag = (a >> 8) & 255
  const ab = a & 255
  const br = (b >> 16) & 255
  const bg = (b >> 8) & 255
  const bb = b & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}
