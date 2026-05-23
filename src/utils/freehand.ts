// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { getStroke } from 'perfect-freehand'

const STROKE_OPTIONS = {
  size: 18,
  thinning: 0.6,
  smoothing: 0.5,
  streamline: 0.5
}

/**
 * Convert a list of [x, y] input points into an SVG path describing a smooth,
 * filled freehand stroke. Returns an empty string when there are no points.
 */
export function strokeToPath(points: readonly number[][]): string {
  if (points.length === 0) return ''
  const outline = getStroke(points as number[][], STROKE_OPTIONS)
  if (outline.length === 0) return ''

  const d = outline.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', outline[0][0], outline[0][1], 'Q'] as (string | number)[]
  )
  d.push('Z')
  return d.join(' ')
}
