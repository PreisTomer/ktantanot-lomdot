// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { BEAR_SCENE_H, BEAR_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const DESK_TOP = '#fff3da'
const DESK_BOTTOM = '#ffe2c2'
const BANDS = 12
const PLATE_X = BEAR_SCENE_W / 2
const PLATE_Y = BEAR_SCENE_H * 0.72
const PLATE_RX = 200
const CAKE_GAP_X = 46
const CAKE_SIZE = 38
// Each addend gets its own row, offset above/below the plate centre.
const ROW_DY = 28

// המסעדה של הדוב scene: the two cake groups fly onto the bear's plate by
// themselves (the first group, then the second), showing the addition; the
// child then taps the total. No drag. Same crash-safe rules as the other
// scenes (markRaw in the component, tracked tweens; cake slide-in tweens kill
// themselves on completion so they can't render onto a destroyed cake later).
export class BearScene {
  private app: Application | null = null
  private bear: Text | null = null
  private equation: Text | null = null
  private cakes: Text[] = []

  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private endTween(anim: Anim): void {
    this.tweens.delete(anim)
    anim.kill()
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: BEAR_SCENE_W,
      height: BEAR_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const desk = new Graphics()
    const bandHeight = BEAR_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(DESK_TOP, DESK_BOTTOM, i / (BANDS - 1))
      desk.rect(0, i * bandHeight, BEAR_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(desk)
    this.app.stage.addChild(
      new Graphics().roundRect(0, BEAR_SCENE_H * 0.5, BEAR_SCENE_W, BEAR_SCENE_H * 0.5, 0).fill({ color: SCENE.carEmpty })
    )

    const bear = new Text({ text: '🐻', style: { fontFamily: FONT, fontSize: 130 } })
    bear.anchor.set(0.5)
    bear.position.set(PLATE_X, BEAR_SCENE_H * 0.3)
    bear.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(bear)
    this.bear = bear

    const equation = new Text({ text: '', style: { fontFamily: FONT, fontSize: 50, fontWeight: '700', fill: SCENE.letterInk } })
    equation.anchor.set(0.5)
    equation.position.set(PLATE_X, 56)
    this.app.stage.addChild(equation)
    this.equation = equation

    const plate = new Graphics()
    plate.ellipse(PLATE_X, PLATE_Y, PLATE_RX, 60).fill({ color: SCENE.white })
    plate.ellipse(PLATE_X, PLATE_Y, PLATE_RX - 16, 48).fill({ color: SCENE.trainWindow })
    this.app.stage.addChild(plate)
  }

  setRound(a: number, b: number): void {
    for (const cake of this.cakes) cake.destroy()
    this.cakes = []
    if (this.equation) this.equation.text = `${a} + ${b} = ?`
    if (!this.app) return

    // The first addend is always the top row, the second the bottom row, so the
    // two groups in the equation map one-to-one to the two rows of cakes.
    this.spawnRow(a, PLATE_Y - ROW_DY, true, 0)
    this.spawnRow(b, PLATE_Y + ROW_DY, false, a * 0.12 + 0.35)
  }

  // Fly `count` cakes into a single centred row at `y`; the first group enters
  // from the left, the second from the right, so the addition reads as combining.
  private spawnRow(count: number, y: number, fromLeft: boolean, baseDelay: number): void {
    const usable = (PLATE_RX - 24) * 2
    const gap = count > 1 ? Math.min(CAKE_GAP_X, usable / (count - 1)) : 0
    for (let i = 0; i < count; i++) {
      const targetX = PLATE_X + (i - (count - 1) / 2) * gap
      const cake = new Text({ text: '🧁', style: { fontFamily: FONT, fontSize: CAKE_SIZE } })
      cake.anchor.set(0.5)
      cake.position.set(fromLeft ? -60 : BEAR_SCENE_W + 60, y)
      this.app?.stage.addChild(cake)
      this.cakes.push(cake)
      const tween: Anim = gsap.to(cake, {
        x: targetX,
        duration: 0.45,
        delay: baseDelay + i * 0.12,
        ease: 'back.out(1.4)',
        onComplete: () => this.endTween(tween)
      })
      this.track(tween)
    }
  }

  cheer(): void {
    if (!this.bear) return
    this.track(gsap.to(this.bear.scale, { x: 1.15, y: 1.15, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.cakes = []
    this.bear = null
    this.equation = null
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
