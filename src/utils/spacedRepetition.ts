// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { MASTERY_WEIGHT_FLOOR } from '@/constants/gameConfig'
import type { Rng } from '@/utils/rng'
import type { ItemStat } from '@/types/progress'

/**
 * Choose the next item to practise. Unseen items come first; among seen items,
 * lower accuracy raises selection weight so weak items resurface more often.
 * @param allIds - every practisable item id
 * @param stats - per-item history (missing entry means unseen)
 * @param rng - injected randomness source (seed it in tests)
 * @param exclude - recently-used ids to avoid repeating (ignored if it would
 *   leave no candidates)
 */
export function pickNextItem(
  allIds: readonly string[],
  stats: Record<string, ItemStat>,
  rng: Rng,
  exclude: readonly string[] = []
): string {
  if (allIds.length === 0) {
    throw new Error('pickNextItem requires at least one item')
  }

  const filtered = allIds.filter((id) => !exclude.includes(id))
  const pool = filtered.length > 0 ? filtered : allIds

  const unseen = pool.filter((id) => !stats[id] || stats[id].seen === 0)
  if (unseen.length > 0) {
    return unseen[Math.floor(rng() * unseen.length)]
  }

  const weights = pool.map((id) => {
    const stat = stats[id]
    const accuracy = stat.correct / stat.seen
    return 1 - accuracy + MASTERY_WEIGHT_FLOOR
  })
  return pickWeighted(pool, weights, rng)
}

function pickWeighted(ids: readonly string[], weights: number[], rng: Rng): string {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let threshold = rng() * total
  for (let i = 0; i < ids.length; i++) {
    threshold -= weights[i]
    if (threshold < 0) return ids[i]
  }
  return ids[ids.length - 1]
}
