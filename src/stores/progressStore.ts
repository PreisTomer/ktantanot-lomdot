// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { defineStore } from 'pinia'

import { STARS_PER_CORRECT } from '@/constants/gameConfig'
import type { ItemStat, ProfileProgress, ProgressByProfile } from '@/types/progress'

const STORAGE_KEY = 'ktantanot:progress:v1'

function emptyProgress(): ProfileProgress {
  return { stars: 0, items: {} }
}

// Persisted JSON is untrusted (it can be hand-edited or left over from an older
// schema), so coerce every field to the expected shape rather than assuming it.
function sanitize(parsed: Record<string, Partial<ProfileProgress>>): ProgressByProfile {
  const out: ProgressByProfile = {}
  for (const [id, progress] of Object.entries(parsed)) {
    if (!progress || typeof progress !== 'object') continue
    const items: Record<string, ItemStat> = {}
    const rawItems = progress.items
    if (rawItems && typeof rawItems === 'object') {
      for (const [itemId, stat] of Object.entries(rawItems)) {
        if (!stat || typeof stat !== 'object') continue
        items[itemId] = {
          seen: Number(stat.seen) || 0,
          correct: Number(stat.correct) || 0,
          lastSeen: Number(stat.lastSeen) || 0
        }
      }
    }
    out[id] = { stars: Number(progress.stars) || 0, items }
  }
  return out
}

function loadFromStorage(): ProgressByProfile {
  if (typeof localStorage === 'undefined') return {}
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<ProfileProgress>>
    if (!parsed || typeof parsed !== 'object') return {}
    return sanitize(parsed)
  } catch (error) {
    console.warn('Could not parse stored progress; starting fresh.', error)
    return {}
  }
}

interface ProgressState {
  byProfile: ProgressByProfile
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => ({ byProfile: loadFromStorage() }),
  getters: {
    starsFor: (state) => (profileId: string): number =>
      state.byProfile[profileId]?.stars ?? 0
  },
  actions: {
    ensureProfile(profileId: string): ProfileProgress {
      const existing = this.byProfile[profileId]
      if (existing) return existing
      const fresh = emptyProgress()
      this.byProfile[profileId] = fresh
      return fresh
    },

    recordAnswer(
      profileId: string,
      itemId: string,
      isCorrect: boolean,
      now: number = Date.now()
    ): void {
      const progress = this.ensureProfile(profileId)
      const stat = progress.items[itemId] ?? { seen: 0, correct: 0, lastSeen: 0 }
      stat.seen += 1
      stat.lastSeen = now
      if (isCorrect) {
        stat.correct += 1
        progress.stars += STARS_PER_CORRECT
      }
      progress.items[itemId] = stat
      this.persist()
    },

    persist(): void {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.byProfile))
      } catch (error) {
        console.warn('Could not persist progress.', error)
      }
    }
  }
})
