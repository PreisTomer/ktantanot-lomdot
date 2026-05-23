// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface ItemStat {
  seen: number
  correct: number
  lastSeen: number
}

export interface ProfileProgress {
  stars: number
  items: Record<string, ItemStat>
}

export type ProgressByProfile = Record<string, ProfileProgress>
