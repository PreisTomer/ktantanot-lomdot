// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { generateShuffle } from '@/utils/cupShuffle'
import { createRng } from '@/utils/rng'

function track(start: number, swaps: [number, number][]): number {
  let slot = start
  for (const [i, j] of swaps) {
    if (slot === i) slot = j
    else if (slot === j) slot = i
  }
  return slot
}

describe('generateShuffle', () => {
  it('produces the requested number of valid distinct-pair swaps in range', () => {
    for (let seed = 0; seed < 60; seed++) {
      const round = generateShuffle(3, 4, createRng(seed))
      expect(round.swaps).toHaveLength(4)
      for (const [i, j] of round.swaps) {
        expect(i).not.toBe(j)
        expect(i).toBeGreaterThanOrEqual(0)
        expect(i).toBeLessThan(3)
        expect(j).toBeGreaterThanOrEqual(0)
        expect(j).toBeLessThan(3)
      }
    }
  })

  it('reports the ball slot that matches tracking it through the swaps', () => {
    for (let seed = 0; seed < 60; seed++) {
      const round = generateShuffle(3, 5, createRng(seed))
      expect(round.ballSlot).toBe(track(round.startSlot, round.swaps))
    }
  })
})
