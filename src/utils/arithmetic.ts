// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import { ANSWER_OPTIONS } from '@/constants/gameConfig'
import type { Rng } from '@/utils/rng'

export interface AdditionProblem {
  a: number
  b: number
  answer: number
  options: number[]
}

/**
 * Generate an addition problem whose sum never exceeds maxSum, plus a shuffled
 * set of answer options (one correct, the rest in-range distractors).
 * @param maxSum - largest allowed sum
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateAddition(maxSum: number, rng: Rng): AdditionProblem {
  const a = Math.floor(rng() * (maxSum + 1))
  const b = Math.floor(rng() * (maxSum - a + 1))
  const answer = a + b
  return { a, b, answer, options: buildOptions(answer, maxSum, rng) }
}

function buildOptions(answer: number, maxSum: number, rng: Rng): number[] {
  const target = Math.min(ANSWER_OPTIONS, maxSum + 1)
  const pool = new Set<number>([answer])
  while (pool.size < target) {
    pool.add(Math.floor(rng() * (maxSum + 1)))
  }
  return shuffle([...pool], rng)
}
