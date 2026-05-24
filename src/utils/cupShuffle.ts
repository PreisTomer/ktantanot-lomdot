// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Rng } from '@/utils/rng'

export interface ShuffleRound {
  startSlot: number
  swaps: [number, number][]
  ballSlot: number
}

/**
 * Plan a shell-game round: the ball starts under one cup, then a series of
 * slot-swaps shuffle the cups. The ball follows its cup, so the final slot is
 * derived by tracking it through every swap.
 * @param cupCount - number of cups/slots
 * @param swapCount - how many swaps to perform
 * @param rng - injected randomness source (seed it in tests)
 */
export function generateShuffle(cupCount: number, swapCount: number, rng: Rng): ShuffleRound {
  const startSlot = Math.floor(rng() * cupCount)
  const swaps: [number, number][] = []
  let ballSlot = startSlot

  for (let k = 0; k < swapCount; k++) {
    const i = Math.floor(rng() * cupCount)
    let j = Math.floor(rng() * (cupCount - 1))
    if (j >= i) j += 1 // ensure j !== i
    swaps.push([i, j])
    if (ballSlot === i) ballSlot = j
    else if (ballSlot === j) ballSlot = i
  }

  return { startSlot, swaps, ballSlot }
}
