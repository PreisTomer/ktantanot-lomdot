// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

/**
 * Whether the user has asked the OS to minimise non-essential motion. Pixi/GSAP
 * tweens are JavaScript and are not covered by the global CSS reduced-motion
 * query, so scenes must check this to skip decorative continuous animation.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
