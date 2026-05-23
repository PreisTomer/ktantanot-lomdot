// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createRng } from '@/utils/rng'
import { shuffle } from '@/utils/shuffle'

describe('shuffle', () => {
  it('preserves every element exactly once', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input, createRng(3))
    expect([...result].sort((a, b) => a - b)).toEqual(input)
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    shuffle(input, createRng(9))
    expect(input).toEqual([1, 2, 3])
  })

  it('is deterministic for a given seed', () => {
    const input = ['a', 'b', 'c', 'd']
    expect(shuffle(input, createRng(11))).toEqual(shuffle(input, createRng(11)))
  })

  it('returns an empty array for empty input', () => {
    expect(shuffle([], createRng(1))).toEqual([])
  })
})
