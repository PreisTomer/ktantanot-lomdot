// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export const ICON = {
  STAR: '⭐',
  HEART: '❤️',
  SPEAKER: '🔊',
  HOME: '🏠',
  SEARCH: '🔍',
  PENCIL: '✏️',
  PLUS: '➕',
  MINUS: '➖',
  PUZZLE: '🧩',
  NUMBERS: '🔢',
  LETTERS: 'א',
  UNICORN: '🦄',
  BUTTERFLY: '🦋',
  CAT: '🐱',
  RABBIT: '🐰'
} as const

export type IconKey = keyof typeof ICON
