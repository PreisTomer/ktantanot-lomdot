// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { describe, expect, it } from 'vitest'

import { generateTowerRound } from './towerOrder'
import { createRng } from './rng'

describe('generateTowerRound', () => {
  it('returns the requested number of blocks', () => {
    const round = generateTowerRound(9, 3, createRng(1))
    expect(round.blocks).toHaveLength(3)
    expect(round.order).toHaveLength(3)
  })

  it('chooses distinct numbers within 1..max', () => {
    const round = generateTowerRound(9, 4, createRng(42))
    expect(new Set(round.blocks).size).toBe(4)
    for (const value of round.blocks) {
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(9)
    }
  })

  it('orders the same numbers ascending', () => {
    const round = generateTowerRound(9, 4, createRng(7))
    expect(round.order).toEqual([...round.blocks].sort((a, b) => a - b))
    expect(round.order).toEqual([...round.order].sort((a, b) => a - b))
  })

  it('does not present the blocks already sorted across seeds', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const round = generateTowerRound(9, 3, createRng(seed))
      const sorted = round.blocks.every((v, i) => i === 0 || round.blocks[i - 1] < v)
      expect(sorted).toBe(false)
    }
  })
})
