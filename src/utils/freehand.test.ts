// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { strokeToPath } from '@/utils/freehand'

describe('strokeToPath', () => {
  it('returns an empty string when there are no points', () => {
    expect(strokeToPath([])).toBe('')
  })

  it('produces a closed SVG path for a set of points', () => {
    const path = strokeToPath([
      [10, 10],
      [20, 20],
      [30, 10],
      [40, 30]
    ])
    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
  })
})
