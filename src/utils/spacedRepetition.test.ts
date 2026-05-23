// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { ItemStat } from '@/types/progress'

function stat(seen: number, correct: number): ItemStat {
  return { seen, correct, lastSeen: 0 }
}

describe('pickNextItem', () => {
  it('throws when there are no items', () => {
    expect(() => pickNextItem([], {}, createRng(1))).toThrow()
  })

  it('prefers an unseen item over seen ones', () => {
    const stats = { a: stat(5, 5), b: stat(3, 3) }
    expect(pickNextItem(['a', 'b', 'c'], stats, createRng(1))).toBe('c')
  })

  it('treats a missing stat entry as unseen', () => {
    expect(pickNextItem(['x', 'y'], { x: stat(2, 2) }, createRng(2))).toBe('y')
  })

  it('never returns an excluded id when other candidates exist', () => {
    const stats = { a: stat(3, 3), b: stat(3, 3), c: stat(3, 3) }
    for (let seed = 0; seed < 50; seed++) {
      const pick = pickNextItem(['a', 'b', 'c'], stats, createRng(seed), ['a'])
      expect(pick).not.toBe('a')
    }
  })

  it('falls back to all ids when every candidate is excluded', () => {
    const pick = pickNextItem(['a', 'b'], {}, createRng(1), ['a', 'b'])
    expect(['a', 'b']).toContain(pick)
  })

  it('resurfaces the weakest item most often once all are seen', () => {
    const stats = { strong: stat(10, 10), weak: stat(10, 1) }
    const counts = { strong: 0, weak: 0 }
    for (let seed = 0; seed < 200; seed++) {
      counts[pickNextItem(['strong', 'weak'], stats, createRng(seed)) as 'strong' | 'weak']++
    }
    expect(counts.weak).toBeGreaterThan(counts.strong)
  })
})
