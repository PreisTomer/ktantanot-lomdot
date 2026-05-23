// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

// Pre-resolved colour constants for hardcoded contexts where CSS custom
// properties cannot be read: canvas fillStyle/strokeStyle (confetti, letter
// tracing). Keep in sync with the --color-* tokens in src/style.css.

export const COLOR = {
  primary: '#ffb703',
  primaryDeep: '#fb8500',
  sky: '#48cae4',
  skyDeep: '#0096c7',
  coral: '#ff6b9d',
  coralDeep: '#e5446d',
  leaf: '#80ed99',
  leafDeep: '#38b000',
  grape: '#c77dff',
  grapeDeep: '#9d4edd',
  sun: '#ffd60a',
  correct: '#38b000',
  retry: '#ff9e00',
  ink: '#3a2e2a',
  white: '#ffffff'
} as const

// Confetti / reward bursts draw from the full bright palette.
export const CONFETTI_COLORS: readonly string[] = [
  COLOR.primary,
  COLOR.sky,
  COLOR.coral,
  COLOR.leaf,
  COLOR.grape,
  COLOR.sun
]

export type ColorName = keyof typeof COLOR
