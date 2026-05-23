// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { availableInitials, buildSoundOptions } from '@/utils/initialSound'
import { createRng } from '@/utils/rng'

const WORDS = [
  { word: 'שמש' },
  { word: 'שולחן' },
  { word: 'בית' },
  { word: 'כלב' },
  { word: 'דג' },
  { word: 'פרח' }
]

describe('availableInitials', () => {
  it('lists letters that have enough other-letter distractors', () => {
    const initials = availableInitials(WORDS, 4)
    expect(initials).toContain('ש')
    expect(initials).toContain('ב')
  })

  it('excludes a letter when too few other words exist', () => {
    const tiny = [{ word: 'אבא' }, { word: 'אמא' }]
    expect(availableInitials(tiny, 4)).toEqual([])
  })
})

describe('buildSoundOptions', () => {
  it('returns the requested number of choices', () => {
    const options = buildSoundOptions(WORDS, 'ש', 4, createRng(1))
    expect(options).toHaveLength(4)
  })

  it('includes exactly one word starting with the target letter', () => {
    for (let seed = 0; seed < 40; seed++) {
      const options = buildSoundOptions(WORDS, 'ש', 4, createRng(seed))
      const matching = options.filter((item) => item.word[0] === 'ש')
      expect(matching).toHaveLength(1)
    }
  })

  it('draws every option from the pool', () => {
    const options = buildSoundOptions(WORDS, 'ב', 4, createRng(5))
    for (const option of options) {
      expect(WORDS).toContain(option)
    }
  })
})
