// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { prefersReducedMotion } from '@/utils/motion'
import { ROOM_SCENE_H, ROOM_SCENE_W } from '@/constants/gameConfig'
import type { RoomItem } from '@/constants/memoryItems'

type Anim = gsap.core.Tween | gsap.core.Timeline

interface PlacedItem {
  key: string
  text: Text
  x: number
  y: number
}

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const FLOOR_H = 120
const SHELF_Y = ROOM_SCENE_H - FLOOR_H - 70
const SHELF_THICK = 18
const ITEM_SIZE = 92
const MARGIN = 130

// מה היה בחדר scene: objects sit on a shelf in a cosy room; the lights dim, one
// object vanishes, then the lights come back on a glowing empty gap. Same
// crash-safe rules as the other scenes (markRaw in the component, tracked
// tweens; nothing is created-then-destroyed inside a GSAP callback).
export class RoomScene {
  private app: Application | null = null
  private items: PlacedItem[] = []
  private cover: Graphics | null = null
  private gap: Container | null = null
  private readonly slots: number[] = []
  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: ROOM_SCENE_W,
      height: ROOM_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.buildCover()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const wall = new Graphics()
    const bandHeight = ROOM_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.roomTop, SCENE.roomBottom, i / (BANDS - 1))
      wall.rect(0, i * bandHeight, ROOM_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(wall)

    const window = new Graphics()
      .roundRect(ROOM_SCENE_W - 250, 50, 180, 150, 14)
      .fill({ color: SCENE.shelfEdge })
    window.roundRect(ROOM_SCENE_W - 240, 60, 160, 130, 10).fill({ color: SCENE.trainWindow })
    window.circle(ROOM_SCENE_W - 130, 96, 26).fill({ color: SCENE.sun })
    this.app.stage.addChild(window)

    this.app.stage.addChild(
      new Graphics().rect(0, ROOM_SCENE_H - FLOOR_H, ROOM_SCENE_W, FLOOR_H).fill({ color: SCENE.floor })
    )

    const span = ROOM_SCENE_W - MARGIN * 2
    const shelf = new Graphics()
      .roundRect(MARGIN - 20, SHELF_Y + ITEM_SIZE / 2, span + 40, SHELF_THICK, 6)
      .fill({ color: SCENE.shelf })
    shelf.roundRect(MARGIN - 20, SHELF_Y + ITEM_SIZE / 2 + SHELF_THICK - 6, span + 40, 6, 3).fill({ color: SCENE.shelfEdge })
    shelf.filters = [new DropShadowFilter({ alpha: 0.25, blur: 4 })]
    this.app.stage.addChild(shelf)
  }

  private buildCover(): void {
    if (!this.app) return
    const cover = new Graphics().rect(0, 0, ROOM_SCENE_W, ROOM_SCENE_H).fill({ color: SCENE.cover })
    cover.alpha = 0
    cover.eventMode = 'none'
    this.app.stage.addChild(cover)
    this.cover = cover
  }

  private slotX(index: number, count: number): number {
    if (count === 1) return ROOM_SCENE_W / 2
    const span = ROOM_SCENE_W - MARGIN * 2
    return MARGIN + (span / (count - 1)) * index
  }

  setRound(shown: RoomItem[]): void {
    if (!this.app) return
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.clearItems()
    this.removeGap()
    if (this.cover) this.cover.alpha = 0

    this.slots.length = 0
    shown.forEach((item, i) => {
      const x = this.slotX(i, shown.length)
      this.slots.push(x)
      const text = new Text({ text: item.emoji, style: { fontFamily: FONT, fontSize: ITEM_SIZE } })
      text.anchor.set(0.5)
      text.position.set(x, SHELF_Y)
      text.filters = [new DropShadowFilter({ alpha: 0.28, blur: 3 })]
      this.app?.stage.addChild(text)
      this.items.push({ key: item.key, text, x, y: SHELF_Y })
      if (!prefersReducedMotion()) {
        this.track(gsap.to(text, { y: SHELF_Y - 6, duration: 1.8 + i * 0.15, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
      }
    })
  }

  // Dim the lights, remove the missing object behind the cover, then bring the
  // lights back up on a glowing gap. Resolves once the room is lit again.
  conceal(missingKey: string): Promise<void> {
    return new Promise((resolve) => {
      const cover = this.cover
      if (!cover) {
        resolve()
        return
      }
      cover.alpha = 0
      const timeline = gsap.timeline({ onComplete: () => resolve() })
      timeline.to(cover, { alpha: 0.94, duration: 0.45, ease: 'power2.in' })
      timeline.add(() => this.hideItem(missingKey))
      timeline.to(cover, { alpha: 0, duration: 0.55, ease: 'power2.out', delay: 0.25 })
      this.track(timeline)
    })
  }

  private hideItem(key: string): void {
    const item = this.items.find((entry) => entry.key === key)
    if (!item) return
    gsap.killTweensOf(item.text)
    item.text.visible = false
    this.addGap(item.x, item.y)
  }

  private addGap(x: number, y: number): void {
    if (!this.app) return
    const gap = new Container()
    const glow = new Graphics().circle(0, 0, ITEM_SIZE * 0.5).fill({ color: SCENE.white })
    glow.alpha = 0.35
    const ring = new Graphics().circle(0, 0, ITEM_SIZE * 0.5).stroke({ color: SCENE.white, width: 4, alpha: 0.8 })
    const mark = new Text({ text: '?', style: { fontFamily: FONT, fontSize: 56, fontWeight: '700', fill: SCENE.white } })
    mark.anchor.set(0.5)
    gap.addChild(glow, ring, mark)
    gap.position.set(x, y)
    this.app.stage.addChild(gap)
    this.gap = gap
    if (!prefersReducedMotion()) {
      this.track(gsap.to(gap.scale, { x: 1.12, y: 1.12, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    }
  }

  private removeGap(): void {
    if (this.gap) {
      gsap.killTweensOf(this.gap.scale)
      this.gap.destroy({ children: true })
      this.gap = null
    }
  }

  // The recalled object reappears in its gap with a pop.
  reveal(key: string): void {
    this.removeGap()
    const item = this.items.find((entry) => entry.key === key)
    if (!item) return
    item.text.visible = true
    item.text.scale.set(0)
    this.track(gsap.to(item.text.scale, { x: 1, y: 1, duration: 0.5, ease: 'back.out(2)' }))
  }

  private clearItems(): void {
    for (const item of this.items) item.text.destroy()
    this.items = []
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.clearItems()
    this.gap = null
    this.cover = null
    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true })
      } catch {
        // Renderer already torn down; nothing to clean up.
      }
    }
    this.app = null
  }
}
