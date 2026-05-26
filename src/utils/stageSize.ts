// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

export interface StageSize {
  width: number
  height: number
}

// Portrait phones get the scene's tall layout so the game fills the screen;
// tablets and any landscape keep the wider landscape layout (which already fits).
export function isPortraitPhone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches
}

export function pickStageSize(landscape: StageSize, portrait: StageSize): StageSize {
  return isPortraitPhone() ? portrait : landscape
}

// Re-run `onChange` whenever the device crosses the portrait-phone boundary
// (rotation / resize), so a scene can re-lay-out. Returns a cleanup function.
export function watchStageOrientation(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  const mql = window.matchMedia('(max-width: 600px) and (orientation: portrait)')
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
