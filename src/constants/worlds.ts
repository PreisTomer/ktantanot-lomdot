// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { GAME_ID, LOCALE, WORLD_ID } from '@/constants/strings'
import { ICON } from '@/constants/icons'
import type { GameId, Locale } from '@/constants/strings'
import type { WorldDef } from '@/types/world'

// Games that are fully playable; the rest show a "coming soon" screen.
export const READY_GAMES: ReadonlySet<GameId> = new Set([
  GAME_ID.SYLLABLE_TRAIN,
  GAME_ID.CATCH_WORD,
  GAME_ID.SOUND_DETECTIVE,
  GAME_ID.MAGIC_BOOK,
  GAME_ID.NIQQUD_SOUND,
  GAME_ID.THIEF_MONKEY,
  GAME_ID.FROG_JUMPS,
  GAME_ID.BEAR_RESTAURANT,
  GAME_ID.BUILD_TOWER,
  GAME_ID.WHAT_IN_ROOM,
  GAME_ID.SOUND_SIMON,
  GAME_ID.COMPLETE_SEQUENCE,
  GAME_ID.WHERE_HIDDEN,
  GAME_ID.REMEMBER_PATH,
  GAME_ID.SISTERS_MISSION
])

// Games whose content is intrinsically Hebrew (niqqud, Hebrew-specific phonics).
// These are hidden from the world grid in non-Hebrew locales.
const LOCALE_ONLY_GAMES: ReadonlySet<GameId> = new Set([GAME_ID.NIQQUD_SOUND])

export function isGameAvailableInLocale(gameId: GameId, locale: Locale): boolean {
  if (locale === LOCALE.HE) return true
  return !LOCALE_ONLY_GAMES.has(gameId)
}

// Array order is DOM order; under RTL the first entry sits on the right,
// so reading flows right-to-left as required.
export const WORLDS: WorldDef[] = [
  {
    id: WORLD_ID.READING,
    icon: ICON.BOOK,
    colorToken: 'coral',
    games: [
      { id: GAME_ID.SYLLABLE_TRAIN, icon: ICON.TRAIN },
      { id: GAME_ID.CATCH_WORD, icon: ICON.BALLOON },
      { id: GAME_ID.SOUND_DETECTIVE, icon: ICON.DETECTIVE },
      { id: GAME_ID.MAGIC_BOOK, icon: ICON.BOOK },
      { id: GAME_ID.NIQQUD_SOUND, icon: ICON.NIQQUD }
    ]
  },
  {
    id: WORLD_ID.MATH,
    icon: ICON.BEAR,
    colorToken: 'leaf',
    games: [
      { id: GAME_ID.BEAR_RESTAURANT, icon: ICON.BEAR },
      { id: GAME_ID.THIEF_MONKEY, icon: ICON.MONKEY },
      { id: GAME_ID.FROG_JUMPS, icon: ICON.FROG },
      { id: GAME_ID.BUILD_TOWER, icon: ICON.BLOCKS }
    ]
  },
  {
    id: WORLD_ID.MEMORY,
    icon: ICON.BELL,
    colorToken: 'grape',
    games: [
      { id: GAME_ID.WHAT_IN_ROOM, icon: ICON.COUCH },
      { id: GAME_ID.SOUND_SIMON, icon: ICON.BELL },
      { id: GAME_ID.WHERE_HIDDEN, icon: ICON.BOXES },
      { id: GAME_ID.COMPLETE_SEQUENCE, icon: ICON.PATTERN },
      { id: GAME_ID.REMEMBER_PATH, icon: ICON.RABBIT }
    ]
  },
  {
    id: WORLD_ID.SISTERS,
    icon: ICON.SISTERS,
    colorToken: 'sky',
    games: [{ id: GAME_ID.SISTERS_MISSION, icon: ICON.SISTERS }]
  }
]

export function findWorldForGame(gameId: GameId): WorldDef | undefined {
  return WORLDS.find((world) => world.games.some((game) => game.id === gameId))
}
