// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { shuffle } from '@/utils/shuffle'
import type { Rng } from '@/utils/rng'

export interface HasWord {
  word: string
}

/**
 * Initial letters that can anchor a round: at least one word starts with the
 * letter, and there are enough other-letter words to fill the distractors.
 * @param items - the word pool
 * @param optionCount - choices shown per round
 */
export function availableInitials<T extends HasWord>(items: readonly T[], optionCount: number): string[] {
  const initials = [...new Set(items.map((item) => item.word[0]))]
  return initials.filter((letter) => {
    const others = items.filter((item) => item.word[0] !== letter).length
    return others >= optionCount - 1
  })
}

/**
 * Build a shuffled set of choices for a target initial letter: exactly one word
 * starts with the target, the rest start with other letters.
 * @param items - the word pool
 * @param target - the initial letter to find
 * @param optionCount - number of choices
 * @param rng - injected randomness source (seed it in tests)
 */
export function buildSoundOptions<T extends HasWord>(
  items: readonly T[],
  target: string,
  optionCount: number,
  rng: Rng
): T[] {
  const matching = items.filter((item) => item.word[0] === target)
  const others = items.filter((item) => item.word[0] !== target)
  const correct = matching[Math.floor(rng() * matching.length)]
  const distractors = shuffle(others, rng).slice(0, optionCount - 1)
  return shuffle([correct, ...distractors], rng)
}
