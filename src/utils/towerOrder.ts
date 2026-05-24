// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import type { Rng } from '@/utils/rng'

export interface TowerRound {
  // Numbers in the scrambled order they are shown on the ground.
  blocks: number[]
  // The same numbers in ascending order: the order they must be stacked.
  order: number[]
}

function isAscending(values: number[]): boolean {
  return values.every((value, i) => i === 0 || values[i - 1] < value)
}

/**
 * Pick `count` distinct numbers from 1..max and present them scrambled, with
 * the ascending target order the child must stack them in.
 * @param max - largest available number
 * @param count - how many blocks in the tower
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateTowerRound(max: number, count: number, rng: Rng): TowerRound {
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const chosen = shuffle(pool, rng).slice(0, count)
  const order = [...chosen].sort((a, b) => a - b)
  let blocks = shuffle(chosen, rng)
  let guard = 0
  while (count > 1 && isAscending(blocks) && guard < 10) {
    blocks = shuffle(chosen, rng)
    guard++
  }
  return { blocks, order }
}
