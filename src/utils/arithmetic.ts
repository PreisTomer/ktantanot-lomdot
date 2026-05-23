// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import { ANSWER_OPTIONS } from '@/constants/gameConfig'
import type { Rng } from '@/utils/rng'

export interface ArithmeticProblem {
  a: number
  b: number
  answer: number
  options: number[]
}

export type AdditionProblem = ArithmeticProblem
export type SubtractionProblem = ArithmeticProblem

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

/**
 * Generate a subtraction problem with a non-negative answer, plus shuffled
 * answer options in range.
 * @param maxMinuend - largest allowed starting number
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateSubtraction(maxMinuend: number, rng: Rng): SubtractionProblem {
  const a = Math.floor(rng() * (maxMinuend + 1))
  const b = Math.floor(rng() * (a + 1))
  const answer = a - b
  return { a, b, answer, options: buildOptions(answer, maxMinuend, rng) }
}

export interface JumpProblem {
  start: number
  add: number
  target: number
}

/**
 * Generate a number-line addition jump: the frog starts on `start` and jumps
 * `add` more, landing on `target` (never past `max`).
 * @param max - the highest number on the line
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateJump(max: number, rng: Rng): JumpProblem {
  const start = Math.floor(rng() * max)
  const add = 1 + Math.floor(rng() * (max - start))
  return { start, add, target: start + add }
}

function buildOptions(answer: number, maxSum: number, rng: Rng): number[] {
  const target = Math.min(ANSWER_OPTIONS, maxSum + 1)
  const pool = new Set<number>([answer])
  while (pool.size < target) {
    pool.add(Math.floor(rng() * (maxSum + 1)))
  }
  return shuffle([...pool], rng)
}
