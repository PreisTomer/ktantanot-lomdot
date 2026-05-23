// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { GameId, WorldId } from '@/constants/strings'

export interface GameDef {
  id: GameId
  icon: string
}

export interface WorldDef {
  id: WorldId
  icon: string
  colorToken: string
  games: GameDef[]
}
