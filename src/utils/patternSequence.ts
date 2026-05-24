// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import type { Rng } from '@/utils/rng'

export interface PatternRound {
  sequence: string[]
  missingIndex: number
  answer: string
  options: string[]
}

// Repeating unit templates (symbol indices). Each is sized so the full
// sequence comes out to six cells: the last one is the gap to complete.
const UNITS: { template: number[]; reps: number }[] = [
  { template: [0, 1], reps: 3 }, // A B A B A ?
  { template: [0, 0, 1], reps: 2 }, // A A B A A ?
  { template: [0, 1, 1], reps: 2 }, // A B B A B ?
  { template: [0, 1, 2], reps: 2 } // A B C A B ?
]

/**
 * Build a repeating-pattern round whose last cell is the gap to fill.
 * @param pool - distinct symbols to draw from
 * @param optionCount - number of answer choices (incl. the correct one)
 * @param rng - injected randomness source (seed it in tests)
 */
export function generatePattern(pool: readonly string[], optionCount: number, rng: Rng): PatternRound {
  const unit = UNITS[Math.floor(rng() * UNITS.length)]
  const distinct = Math.max(...unit.template) + 1
  const symbols = shuffle(pool, rng).slice(0, distinct)

  const sequence: string[] = []
  for (let r = 0; r < unit.reps; r++) {
    for (const index of unit.template) {
      sequence.push(symbols[index])
    }
  }

  const missingIndex = sequence.length - 1
  const answer = sequence[missingIndex]

  const options = [answer, ...symbols.filter((symbol) => symbol !== answer)]
  const extra = shuffle(
    pool.filter((symbol) => !symbols.includes(symbol)),
    rng
  )
  while (options.length < optionCount && extra.length > 0) {
    options.push(extra.shift() as string)
  }

  return { sequence, missingIndex, answer, options: shuffle(options, rng) }
}
