// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { GAME_ID, WORLD_ID } from '@/constants/strings'
import { ICON } from '@/constants/icons'
import type { WorldDef } from '@/types/world'

// Array order is DOM order; under RTL the first entry sits on the right,
// so reading flows right-to-left as required.
export const WORLDS: WorldDef[] = [
  {
    id: WORLD_ID.LETTERS,
    icon: ICON.LETTERS,
    colorToken: 'coral',
    games: [
      { id: GAME_ID.LETTER_FIND, icon: ICON.SEARCH },
      { id: GAME_ID.LETTER_TRACE, icon: ICON.PENCIL }
    ]
  },
  {
    id: WORLD_ID.NUMBERS,
    icon: ICON.NUMBERS,
    colorToken: 'sky',
    games: [
      { id: GAME_ID.COUNT, icon: ICON.NUMBERS },
      { id: GAME_ID.NUMBER_FIND, icon: ICON.SEARCH }
    ]
  },
  {
    id: WORLD_ID.MATH,
    icon: ICON.PLUS,
    colorToken: 'leaf',
    games: [
      { id: GAME_ID.ADD, icon: ICON.PLUS },
      { id: GAME_ID.SUBTRACT, icon: ICON.MINUS }
    ]
  },
  {
    id: WORLD_ID.MEMORY,
    icon: ICON.PUZZLE,
    colorToken: 'grape',
    games: [{ id: GAME_ID.MATCH_PAIRS, icon: ICON.PUZZLE }]
  }
]
