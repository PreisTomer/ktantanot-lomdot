// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export const WORLD_ID = {
  READING: 'reading',
  MATH: 'math',
  MEMORY: 'memory',
  SISTERS: 'sisters'
} as const

export type WorldId = (typeof WORLD_ID)[keyof typeof WORLD_ID]

export const GAME_ID = {
  // Reading
  SYLLABLE_TRAIN: 'syllableTrain',
  CATCH_WORD: 'catchWord',
  SOUND_DETECTIVE: 'soundDetective',
  MAGIC_BOOK: 'magicBook',
  // Math
  BEAR_RESTAURANT: 'bearRestaurant',
  THIEF_MONKEY: 'thiefMonkey',
  FROG_JUMPS: 'frogJumps',
  BUILD_TOWER: 'buildTower',
  // Memory
  WHAT_IN_ROOM: 'whatInRoom',
  SOUND_SIMON: 'soundSimon',
  WHERE_HIDDEN: 'whereHidden',
  COMPLETE_SEQUENCE: 'completeSequence',
  REMEMBER_PATH: 'rememberPath',
  // Shared
  SISTERS_MISSION: 'sistersMission'
} as const

export type GameId = (typeof GAME_ID)[keyof typeof GAME_ID]

export const REWARD_TYPE = {
  STAR: 'star',
  CONFETTI: 'confetti'
} as const

export type RewardType = (typeof REWARD_TYPE)[keyof typeof REWARD_TYPE]

// Single shared player until avatars/profiles are introduced.
export const DEFAULT_PROFILE_ID = 'guest'

export const ROUTE = {
  HUB: 'hub',
  WORLD: 'world',
  GAME: 'game'
} as const

export type RouteName = (typeof ROUTE)[keyof typeof ROUTE]

export const LOCALE = {
  HE: 'he',
  EN: 'en'
} as const

export type Locale = (typeof LOCALE)[keyof typeof LOCALE]
