// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { extendPath, walkPositions } from '@/utils/pathWalk'
import { createRng } from '@/utils/rng'

describe('pathWalk', () => {
  it('keeps every visited cell inside the grid as the path grows', () => {
    for (let seed = 0; seed < 40; seed++) {
      const rng = createRng(seed)
      let dirs: number[] = []
      for (let step = 0; step < 8; step++) {
        dirs = extendPath(dirs, 5, 3, 2, 1, rng)
      }
      expect(dirs).toHaveLength(8)
      for (const [col, row] of walkPositions(2, 1, dirs)) {
        expect(col).toBeGreaterThanOrEqual(0)
        expect(col).toBeLessThan(5)
        expect(row).toBeGreaterThanOrEqual(0)
        expect(row).toBeLessThan(3)
      }
    }
  })

  it('keeps the prefix intact when extending', () => {
    const rng = createRng(7)
    const first = extendPath([], 5, 3, 2, 1, rng)
    const second = extendPath(first, 5, 3, 2, 1, rng)
    expect(second.slice(0, first.length)).toEqual(first)
    expect(second).toHaveLength(first.length + 1)
  })

  it('does not immediately reverse the previous step when another move exists', () => {
    // From the centre of a wide grid every direction is in bounds, so the
    // step after a "right" (3) must never be "left" (2).
    const reverse = [1, 0, 3, 2]
    for (let seed = 0; seed < 40; seed++) {
      const rng = createRng(seed)
      let dirs = extendPath([], 7, 7, 3, 3, rng)
      for (let step = 0; step < 6; step++) {
        const prev = dirs[dirs.length - 1]
        dirs = extendPath(dirs, 7, 7, 3, 3, rng)
        expect(dirs[dirs.length - 1]).not.toBe(reverse[prev])
      }
    }
  })
})
