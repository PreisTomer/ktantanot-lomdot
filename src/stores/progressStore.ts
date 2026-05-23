// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { defineStore } from 'pinia'

import { STARS_PER_CORRECT } from '@/constants/gameConfig'
import type { ProfileProgress, ProgressByProfile } from '@/types/progress'

const STORAGE_KEY = 'ktantanot:progress:v1'

function emptyProgress(): ProfileProgress {
  return { stars: 0, items: {} }
}

function loadFromStorage(): ProgressByProfile {
  if (typeof localStorage === 'undefined') return {}
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ProgressByProfile
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
