// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { lerpColor } from '@/utils/color'

describe('lerpColor', () => {
  it('returns the start colour at t=0', () => {
    expect(lerpColor('#112233', '#ffffff', 0)).toBe('#112233')
  })

  it('returns the end colour at t=1', () => {
    expect(lerpColor('#112233', '#aabbcc', 1)).toBe('#aabbcc')
  })

  it('blends to the midpoint at t=0.5', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})
