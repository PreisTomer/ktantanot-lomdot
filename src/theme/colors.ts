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

// Scene colours for procedural Pixi rendering (canvas can't read CSS vars).
export const SCENE = {
  skyTop: '#bdeaff',
  skyBottom: '#eaf9ff',
  sun: '#ffd60a',
  hillFar: '#bfe8b0',
  hillNear: '#80ed99',
  grass: '#5fce7a',
  rail: '#8a6d52',
  tie: '#6b5947',
  trainBody: '#ff6b9d',
  trainBodyLight: '#ffa6c4',
  trainRoof: '#e5446d',
  trainWindow: '#bfe9ff',
  headlight: '#ffe066',
  trainCar: '#48cae4',
  trainCarAlt: '#c77dff',
  wheel: '#3a2e2a',
  wheelRim: '#b9a79f',
  steam: '#ffffff',
  carEmpty: '#ffe8c2',
  letterInk: '#3a2e2a',
  leaf: '#80ed99',
  leafDeep: '#38b000',
  roomTop: '#ffe9c9',
  roomBottom: '#ffd6a0',
  floor: '#e3b483',
  shelf: '#b07d4f',
  shelfEdge: '#8a6038',
  cover: '#241f38',
  stageTop: '#2b2350',
  stageBottom: '#5a4a96',
  stageGlow: '#b9a6ff',
  white: '#ffffff'
} as const

// Tone cycle for answer tiles, so a row of options reads as a lively multi-
// colour set rather than one flat colour. Values map to --color-* tokens.
export const TILE_TONES = ['sky', 'coral', 'leaf', 'sun', 'grape'] as const

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
