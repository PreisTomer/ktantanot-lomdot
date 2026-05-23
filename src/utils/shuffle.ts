// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Rng } from '@/utils/rng'

/**
 * Fisher-Yates shuffle into a new array; the input is not mutated.
 * @param items - source list
 * @param rng - injected randomness source (seed it in tests)
 * @returns a shuffled copy
 */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = result[i]
    result[i] = result[j]
    result[j] = swap
  }
  return result
}
