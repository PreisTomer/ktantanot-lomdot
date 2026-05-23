// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { generateAddition, generateJump, generateSubtraction } from '@/utils/arithmetic'
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

describe('generateSubtraction', () => {
  it('never produces a negative answer', () => {
    for (let seed = 0; seed < 50; seed++) {
      const problem = generateSubtraction(10, createRng(seed))
      expect(problem.answer).toBe(problem.a - problem.b)
      expect(problem.answer).toBeGreaterThanOrEqual(0)
      expect(problem.b).toBeLessThanOrEqual(problem.a)
    }
  })

  it('includes the correct answer among the options', () => {
    const problem = generateSubtraction(10, createRng(6))
    expect(problem.options).toContain(problem.answer)
  })
})

describe('generateJump', () => {
  it('keeps the landing on or below the max and jumps at least one', () => {
    for (let seed = 0; seed < 60; seed++) {
      const jump = generateJump(10, createRng(seed))
      expect(jump.target).toBe(jump.start + jump.add)
      expect(jump.add).toBeGreaterThanOrEqual(1)
      expect(jump.start).toBeGreaterThanOrEqual(0)
      expect(jump.target).toBeLessThanOrEqual(10)
    }
  })
})
