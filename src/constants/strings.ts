// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export const WORLD_ID = {
  LETTERS: 'letters',
  NUMBERS: 'numbers',
  MATH: 'math',
  MEMORY: 'memory'
} as const

export type WorldId = (typeof WORLD_ID)[keyof typeof WORLD_ID]

export const GAME_ID = {
  LETTER_FIND: 'letterFind',
  LETTER_TRACE: 'letterTrace',
  COUNT: 'count',
  NUMBER_FIND: 'numberFind',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MATCH_PAIRS: 'matchPairs'
} as const

export type GameId = (typeof GAME_ID)[keyof typeof GAME_ID]

export const REWARD_TYPE = {
  STAR: 'star',
  CONFETTI: 'confetti'
} as const

export type RewardType = (typeof REWARD_TYPE)[keyof typeof REWARD_TYPE]

export const ROUTE = {
  HUB: 'hub',
  WORLD: 'world'
} as const

export type RouteName = (typeof ROUTE)[keyof typeof ROUTE]
