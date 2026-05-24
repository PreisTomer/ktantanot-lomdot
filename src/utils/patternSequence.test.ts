// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { generatePattern } from '@/utils/patternSequence'
import { createRng } from '@/utils/rng'

const POOL = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '❤️']

describe('generatePattern', () => {
  it('puts the answer in the last (missing) cell', () => {
    for (let seed = 0; seed < 50; seed++) {
      const round = generatePattern(POOL, 4, createRng(seed))
      expect(round.missingIndex).toBe(round.sequence.length - 1)
      expect(round.answer).toBe(round.sequence[round.missingIndex])
    }
  })

  it('includes the answer among the options', () => {
    for (let seed = 0; seed < 50; seed++) {
      const round = generatePattern(POOL, 4, createRng(seed))
      expect(round.options).toContain(round.answer)
      expect(round.options.length).toBeLessThanOrEqual(4)
    }
  })

  it('repeats a consistent unit (every cell matches the cell one period back)', () => {
    const round = generatePattern(POOL, 4, createRng(7))
    // Detect the period from the first repeat of sequence[0].
    const period = round.sequence.findIndex((s, i) => i > 0 && s === round.sequence[0] && round.sequence[i + 1] === round.sequence[1])
    expect(period).toBeGreaterThan(0)
    for (let i = period; i < round.sequence.length; i++) {
      expect(round.sequence[i]).toBe(round.sequence[i - period])
    }
  })

  it('draws every option from the pool', () => {
    const round = generatePattern(POOL, 4, createRng(3))
    for (const option of round.options) {
      expect(POOL).toContain(option)
    }
  })
})
