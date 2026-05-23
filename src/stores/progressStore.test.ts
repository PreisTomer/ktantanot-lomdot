// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { createPinia, setActivePinia } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

const PROFILE = 'one'

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('awards a star for a correct answer', () => {
    const store = useProgressStore()
    store.recordAnswer(PROFILE, 'alef', true, 1000)
    expect(store.starsFor(PROFILE)).toBe(1)
  })

  it('never reduces stars on a wrong answer', () => {
    const store = useProgressStore()
    store.recordAnswer(PROFILE, 'alef', true, 1000)
    store.recordAnswer(PROFILE, 'bet', false, 2000)
    expect(store.starsFor(PROFILE)).toBe(1)
  })

  it('tracks attempts and correct counts per item', () => {
    const store = useProgressStore()
    store.recordAnswer(PROFILE, 'alef', false, 1000)
    store.recordAnswer(PROFILE, 'alef', true, 2000)
    const stat = store.byProfile[PROFILE].items.alef
    expect(stat.seen).toBe(2)
    expect(stat.correct).toBe(1)
    expect(stat.lastSeen).toBe(2000)
  })

  it('restores persisted progress after a reload', () => {
    const first = useProgressStore()
    first.recordAnswer(PROFILE, 'alef', true, 1000)

    setActivePinia(createPinia())
    const reloaded = useProgressStore()
    expect(reloaded.starsFor(PROFILE)).toBe(1)
    expect(reloaded.byProfile[PROFILE].items.alef.correct).toBe(1)
  })
})
