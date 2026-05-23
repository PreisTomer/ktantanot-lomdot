// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import type { Rng } from '@/utils/rng'

/**
 * Build a shuffled set of answer choices that always includes the correct one,
 * filling the rest with distinct distractors drawn from the pool.
 * @param correct - the right answer (must exist in pool)
 * @param pool - all candidate values
 * @param count - desired number of choices (capped at pool size)
 * @param rng - injected randomness source (seed it in tests)
 */
export function buildChoices<T>(correct: T, pool: readonly T[], count: number, rng: Rng): T[] {
  const target = Math.min(count, pool.length)
  const chosen = new Set<T>([correct])
  const maxTries = pool.length * 20
  let tries = 0
  while (chosen.size < target && tries < maxTries) {
    chosen.add(pool[Math.floor(rng() * pool.length)])
    tries++
  }
  return shuffle([...chosen], rng)
}
