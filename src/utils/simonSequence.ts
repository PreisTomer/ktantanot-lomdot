// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Rng } from '@/utils/rng'

/**
 * Append one step to an existing Simon sequence, keeping the whole prefix
 * intact (classic Simon grows by adding a single new pad each level). The new
 * pad never equals the previous one, so each step is a clear, distinct change.
 * @param sequence - the sequence so far (not mutated)
 * @param padCount - how many pads exist (values are 0..padCount-1)
 * @param rng - injected randomness source (seed it in tests)
 * @returns a new array: the old sequence with one pad appended
 */
export function appendStep(sequence: number[], padCount: number, rng: Rng): number[] {
  const prev = sequence[sequence.length - 1]
  let pad = Math.floor(rng() * padCount)
  if (sequence.length > 0 && pad === prev) {
    pad = (pad + 1 + Math.floor(rng() * (padCount - 1))) % padCount
  }
  return [...sequence, pad]
}

/**
 * Build a starting sequence of the given length by appending step by step, so
 * it follows the same no-consecutive-repeat rule as the per-level growth.
 * @param length - number of steps in the sequence
 * @param padCount - how many pads exist (values are 0..padCount-1)
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateToneSequence(length: number, padCount: number, rng: Rng): number[] {
  let sequence: number[] = []
  for (let i = 0; i < length; i++) {
    sequence = appendStep(sequence, padCount, rng)
  }
  return sequence
}
