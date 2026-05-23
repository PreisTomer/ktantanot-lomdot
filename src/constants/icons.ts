// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export const ICON = {
  STAR: '⭐',
  HEART: '❤️',
  SPEAKER: '🔊',
  HOME: '🏠',
  // Reading
  TRAIN: '🚂',
  BALLOON: '🎈',
  DETECTIVE: '🕵️',
  BOOK: '📖',
  // Math
  BEAR: '🐻',
  MONKEY: '🐵',
  FROG: '🐸',
  BLOCKS: '🧱',
  // Memory
  COUCH: '🛋️',
  BELL: '🔔',
  BOXES: '📦',
  PATTERN: '🍎',
  RABBIT: '🐰',
  // Shared
  SISTERS: '👭'
} as const

export type IconKey = keyof typeof ICON
