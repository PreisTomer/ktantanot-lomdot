// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { describe, expect, it } from 'vitest'

import { appendStep, generateToneSequence } from './simonSequence'
import { createRng } from './rng'

describe('generateToneSequence', () => {
  it('produces a sequence of the requested length', () => {
    expect(generateToneSequence(5, 4, createRng(1))).toHaveLength(5)
  })

  it('keeps every value within the pad range', () => {
    const sequence = generateToneSequence(40, 4, createRng(3))
    for (const pad of sequence) {
      expect(pad).toBeGreaterThanOrEqual(0)
      expect(pad).toBeLessThan(4)
    }
  })

  it('never repeats the same pad twice in a row', () => {
    const sequence = generateToneSequence(60, 4, createRng(7))
    for (let i = 1; i < sequence.length; i++) {
      expect(sequence[i]).not.toBe(sequence[i - 1])
    }
  })

  it('is deterministic for a given seed', () => {
    expect(generateToneSequence(8, 4, createRng(9))).toEqual(generateToneSequence(8, 4, createRng(9)))
  })
})

describe('appendStep', () => {
  it('preserves the existing prefix and adds exactly one step', () => {
    const base = [1, 3, 0]
    const grown = appendStep(base, 4, createRng(2))
    expect(grown).toHaveLength(4)
    expect(grown.slice(0, 3)).toEqual(base)
    expect(base).toEqual([1, 3, 0])
  })

  it('never appends the same pad as the last one', () => {
    let sequence = [2]
    const rng = createRng(4)
    for (let i = 0; i < 40; i++) {
      const grown = appendStep(sequence, 4, rng)
      expect(grown[grown.length - 1]).not.toBe(sequence[sequence.length - 1])
      sequence = grown
    }
  })
})
