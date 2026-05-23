// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { buildChoices } from '@/utils/options'
import { createRng } from '@/utils/rng'

const POOL = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז']

describe('buildChoices', () => {
  it('always includes the correct answer', () => {
    const choices = buildChoices('ג', POOL, 4, createRng(1))
    expect(choices).toContain('ג')
  })

  it('returns the requested number of distinct choices', () => {
    const choices = buildChoices('ג', POOL, 4, createRng(2))
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
  })

  it('draws every choice from the pool', () => {
    const choices = buildChoices('ג', POOL, 4, createRng(3))
    for (const choice of choices) {
      expect(POOL).toContain(choice)
    }
  })

  it('caps the count at the pool size', () => {
    const small = ['1', '2']
    const choices = buildChoices('1', small, 4, createRng(4))
    expect(choices).toHaveLength(2)
    expect(choices).toContain('1')
  })

  it('works with numeric pools', () => {
    const numbers = [0, 1, 2, 3, 4, 5]
    const choices = buildChoices(3, numbers, 3, createRng(5))
    expect(choices).toContain(3)
    expect(choices).toHaveLength(3)
  })
})
