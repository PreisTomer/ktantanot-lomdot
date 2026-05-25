// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import type { Rng } from '@/utils/rng'

// Directions as 0=up, 1=down, 2=left, 3=right; deltas are [col, row].
export const DIR_DELTA: readonly [number, number][] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0]
]

const REVERSE: readonly number[] = [1, 0, 3, 2]

/**
 * Replay a list of directions from a start cell, returning every cell visited
 * (including the start).
 */
export function walkPositions(startCol: number, startRow: number, dirs: number[]): [number, number][] {
  const positions: [number, number][] = [[startCol, startRow]]
  let col = startCol
  let row = startRow
  for (const dir of dirs) {
    col += DIR_DELTA[dir][0]
    row += DIR_DELTA[dir][1]
    positions.push([col, row])
  }
  return positions
}

/**
 * Append one in-bounds step to a path, keeping the whole prefix (like Simon's
 * grow-by-one). Avoids immediately reversing the previous step so the path
 * doesn't visibly undo itself; falls back to any in-bounds move if needed.
 * @param dirs - the path so far (not mutated)
 * @param cols - grid width
 * @param rows - grid height
 * @param startCol - path start column
 * @param startRow - path start row
 * @param rng - injected randomness source (seed it in tests)
 */
export function extendPath(
  dirs: number[],
  cols: number,
  rows: number,
  startCol: number,
  startRow: number,
  rng: Rng
): number[] {
  const positions = walkPositions(startCol, startRow, dirs)
  const [col, row] = positions[positions.length - 1]
  const inBounds = [0, 1, 2, 3].filter((dir) => {
    const nc = col + DIR_DELTA[dir][0]
    const nr = row + DIR_DELTA[dir][1]
    return nc >= 0 && nc < cols && nr >= 0 && nr < rows
  })
  const last = dirs[dirs.length - 1]
  const preferred = dirs.length > 0 ? inBounds.filter((dir) => dir !== REVERSE[last]) : inBounds
  const pool = preferred.length > 0 ? preferred : inBounds
  return [...dirs, pool[Math.floor(rng() * pool.length)]]
}
