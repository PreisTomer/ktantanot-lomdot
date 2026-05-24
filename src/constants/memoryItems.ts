// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface RoomItem {
  key: string
  emoji: string
}

// מה היה בחדר — everyday objects a child recognises at a glance, kept visually
// distinct so a missing one is identifiable from its silhouette alone.
export const ROOM_ITEMS: RoomItem[] = [
  { key: 'lamp', emoji: '💡' },
  { key: 'book', emoji: '📚' },
  { key: 'ball', emoji: '⚽' },
  { key: 'teddy', emoji: '🧸' },
  { key: 'clock', emoji: '⏰' },
  { key: 'plant', emoji: '🪴' },
  { key: 'cup', emoji: '☕' },
  { key: 'balloon', emoji: '🎈' },
  { key: 'drum', emoji: '🥁' },
  { key: 'car', emoji: '🚗' },
  { key: 'flower', emoji: '🌸' },
  { key: 'cake', emoji: '🍰' },
  { key: 'hat', emoji: '🎩' },
  { key: 'guitar', emoji: '🎸' }
]
