// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { defineStore } from 'pinia'

import { ICON } from '@/constants/icons'
import type { Profile, Profiles } from '@/types/profile'

// Pre-readers identify themselves by avatar and colour, not by a written name.
function seedProfiles(): Profiles {
  return [
    { id: 'one', avatar: ICON.RABBIT, colorToken: 'coral' },
    { id: 'two', avatar: ICON.BEAR, colorToken: 'grape' }
  ]
}

interface ProfilesState {
  profiles: Profiles
  activeId: string | null
}

export const useProfilesStore = defineStore('profiles', {
  state: (): ProfilesState => ({
    profiles: seedProfiles(),
    activeId: null
  }),
  getters: {
    active: (state): Profile | null =>
      state.profiles.find((profile) => profile.id === state.activeId) ?? null
  },
  actions: {
    setActive(id: string): void {
      this.activeId = id
    }
  }
})
