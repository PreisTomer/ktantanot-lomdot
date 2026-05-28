// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export const ICON = {
  STAR: '⭐',
  HEART: '❤️',
  SPARKLE: '✨',
  PLAY: '▶️',
  SPEAKER: '🔊',
  HOME: '🏠',
  // Reading
  TRAIN: '🚂',
  BALLOON: '🎈',
  DETECTIVE: '🕵️',
  BOOK: '📖',
  NIQQUD: 'אָ',
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
