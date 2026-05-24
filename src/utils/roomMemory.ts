// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import type { RoomItem } from '@/constants/memoryItems'
import type { Rng } from '@/utils/rng'

export interface RoomRound {
  // Objects displayed in the room during the study phase.
  shown: RoomItem[]
  // The object removed from the room; the answer the child must recall.
  missing: RoomItem
  // Answer tiles: the missing object plus distractors that were never shown.
  options: RoomItem[]
}

/**
 * Build a "what disappeared" round: show some objects, remove one, and offer it
 * among distractors that were never in the room (so the answer is recalled, not
 * read off the remaining objects).
 * @param pool - all available objects
 * @param shownCount - how many objects fill the room
 * @param optionCount - how many answer tiles (1 correct + distractors)
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateRoomRound(
  pool: RoomItem[],
  shownCount: number,
  optionCount: number,
  rng: Rng
): RoomRound {
  const shown = shuffle(pool, rng).slice(0, shownCount)
  const missing = shown[Math.floor(rng() * shown.length)]
  const shownKeys = new Set(shown.map((item) => item.key))
  const distractors = shuffle(
    pool.filter((item) => !shownKeys.has(item.key)),
    rng
  ).slice(0, optionCount - 1)
  const options = shuffle([missing, ...distractors], rng)
  return { shown, missing, options }
}
