// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { generateAddition } from '@/utils/arithmetic'
import { createRng } from '@/utils/rng'

describe('generateAddition', () => {
  it('keeps the sum within the requested maximum', () => {
    for (let seed = 0; seed < 50; seed++) {
      const problem = generateAddition(10, createRng(seed))
      expect(problem.answer).toBe(problem.a + problem.b)
      expect(problem.answer).toBeLessThanOrEqual(10)
      expect(problem.a).toBeGreaterThanOrEqual(0)
      expect(problem.b).toBeGreaterThanOrEqual(0)
    }
  })

  it('includes the correct answer among the options', () => {
    const problem = generateAddition(10, createRng(4))
    expect(problem.options).toContain(problem.answer)
  })

  it('offers four distinct in-range options', () => {
    const problem = generateAddition(10, createRng(8))
    expect(problem.options).toHaveLength(4)
    expect(new Set(problem.options).size).toBe(4)
    for (const option of problem.options) {
      expect(option).toBeGreaterThanOrEqual(0)
      expect(option).toBeLessThanOrEqual(10)
    }
  })

  it('caps option count when the range is smaller than four', () => {
    const problem = generateAddition(2, createRng(1))
    expect(problem.options.length).toBeLessThanOrEqual(3)
    expect(problem.options).toContain(problem.answer)
  })
})
