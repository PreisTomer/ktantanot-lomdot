// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { describe, expect, it } from 'vitest'

import { generateRoomRound } from './roomMemory'
import { createRng } from './rng'
import { ROOM_ITEMS } from '@/constants/memoryItems'

describe('generateRoomRound', () => {
  it('shows the requested number of distinct objects', () => {
    const round = generateRoomRound(ROOM_ITEMS, 4, 3, createRng(1))
    expect(round.shown).toHaveLength(4)
    expect(new Set(round.shown.map((item) => item.key)).size).toBe(4)
  })

  it('removes an object that was shown', () => {
    const round = generateRoomRound(ROOM_ITEMS, 4, 3, createRng(9))
    expect(round.shown.map((item) => item.key)).toContain(round.missing.key)
  })

  it('offers the missing object among the answer tiles', () => {
    const round = generateRoomRound(ROOM_ITEMS, 4, 3, createRng(5))
    expect(round.options).toHaveLength(3)
    expect(round.options.map((item) => item.key)).toContain(round.missing.key)
  })

  it('draws distractors that were never in the room', () => {
    const round = generateRoomRound(ROOM_ITEMS, 4, 3, createRng(13))
    const shownKeys = new Set(round.shown.map((item) => item.key))
    const distractors = round.options.filter((item) => item.key !== round.missing.key)
    for (const distractor of distractors) {
      expect(shownKeys.has(distractor.key)).toBe(false)
    }
  })
})
