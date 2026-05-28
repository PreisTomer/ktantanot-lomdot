// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const DESK_TOP = '#fff3da'
const DESK_BOTTOM = '#ffe2c2'
const BANDS = 12
const CAKE_GAP_X = 46
const CAKE_SIZE = 38
// Each addend gets its own row, offset above/below the plate centre.
const ROW_DY = 28

// המסעדה של הדוב scene: the two cake groups fly onto the bear's plate by
// themselves (the first group, then the second), showing the addition; the
// child then taps the total. No drag. Same crash-safe rules as the other
// scenes (markRaw in the component, tracked tweens; cake slide-in tweens kill
// themselves on completion so they can't render onto a destroyed cake later).
//
// Layout is driven entirely by the canvas (w, h) so the same code fills a wide
// landscape stage or a tall portrait one — the component picks the size.
export class BearScene {
  private app: Application | null = null
  private bear: Text | null = null
  private equation: Text | null = null
  private cakes: Text[] = []
  private w = 0
  private h = 0
  private a = 1
  private b = 1

  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private endTween(anim: Anim): void {
    this.tweens.delete(anim)
    anim.kill()
  }

  private get plateX(): number {
    return this.w / 2
  }
  private get plateY(): number {
    return this.h * 0.72
  }
  private get plateRx(): number {
    return Math.min(this.w * 0.42, 220)
  }

  async init(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    this.w = width
    this.h = height
    const app = new Application()
    await app.init({
      canvas,
      width,
      height,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
  }

  // Re-lay-out for a new canvas size (device rotation) without tearing down the
  // Application or its <canvas>; the component re-issues the current round after.
  resize(width: number, height: number): void {
    if (!this.app) return
    this.w = width
    this.h = height
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.app.stage.removeChildren().forEach((child) => child.destroy({ children: true }))
    this.bear = null
    this.equation = null
    this.cakes = []
    this.app.renderer.resize(width, height)
    this.buildBackdrop()
    this.setRound(this.a, this.b)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const desk = new Graphics()
    const bandHeight = this.h / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(DESK_TOP, DESK_BOTTOM, i / (BANDS - 1))
      desk.rect(0, i * bandHeight, this.w, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(desk)
    this.app.stage.addChild(
      new Graphics().roundRect(0, this.h * 0.5, this.w, this.h * 0.5, 0).fill({ color: SCENE.carEmpty })
    )

    const bear = new Text({ text: '🐻', style: { fontFamily: FONT, fontSize: 130 } })
    bear.anchor.set(0.5)
    bear.position.set(this.plateX, this.h * 0.3)
    bear.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(bear)
    this.bear = bear

    const equation = new Text({ text: '', style: { fontFamily: FONT, fontSize: 50, fontWeight: '700', fill: SCENE.letterInk } })
    equation.anchor.set(0.5)
    equation.position.set(this.plateX, this.h * 0.08 + 24)
    this.app.stage.addChild(equation)
    this.equation = equation

    const plate = new Graphics()
    plate.ellipse(this.plateX, this.plateY, this.plateRx, 60).fill({ color: SCENE.white })
    plate.ellipse(this.plateX, this.plateY, this.plateRx - 16, 48).fill({ color: SCENE.trainWindow })
    this.app.stage.addChild(plate)
  }

  setRound(a: number, b: number): void {
    this.a = a
    this.b = b
    for (const cake of this.cakes) cake.destroy()
    this.cakes = []
    if (this.equation) this.equation.text = `${a} + ${b} = ?`
    if (!this.app) return

    // The first addend is always the top row, the second the bottom row, so the
    // two groups in the equation map one-to-one to the two rows of cakes.
    this.spawnRow(a, this.plateY - ROW_DY, true, 0)
    this.spawnRow(b, this.plateY + ROW_DY, false, a * 0.12 + 0.35)
  }

  // Fly `count` cakes into a single centred row at `y`; the first group enters
  // from the left, the second from the right, so the addition reads as combining.
  private spawnRow(count: number, y: number, fromLeft: boolean, baseDelay: number): void {
    const usable = (this.plateRx - 24) * 2
    const gap = count > 1 ? Math.min(CAKE_GAP_X, usable / (count - 1)) : 0
    for (let i = 0; i < count; i++) {
      const targetX = this.plateX + (i - (count - 1) / 2) * gap
      const cake = new Text({ text: '🧁', style: { fontFamily: FONT, fontSize: CAKE_SIZE } })
      cake.anchor.set(0.5)
      cake.position.set(fromLeft ? -60 : this.w + 60, y)
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
    const bear = this.bear
    const baseY = bear.y
    this.track(gsap.to(bear.scale, { x: 1.18, y: 1.18, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
    this.track(gsap.to(bear, { y: baseY - 18, duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.out' }))
  }

  // One-shot opening animation: bear pops in from invisible with a back-out
  // bounce, gives a little head-wiggle "hi", and settles. Resolves when the
  // wiggle ends so the game can spawn the first round's cakes.
  intro(): Promise<void> {
    const bear = this.bear
    if (!bear) return Promise.resolve()
    bear.alpha = 0
    bear.scale.set(0)
    bear.rotation = 0
    return new Promise<void>((resolve) => {
      let done = false
      const finish = (): void => {
        if (done) return
        done = true
        resolve()
      }
      const tl = gsap.timeline({ onComplete: finish })
      tl.to(bear, { alpha: 1, duration: 0.25 })
      tl.to(bear.scale, { x: 1, y: 1, duration: 0.55, ease: 'back.out(2)' }, '<')
      tl.to(bear, { rotation: -0.18, duration: 0.18, ease: 'sine.out' })
      tl.to(bear, { rotation: 0.14, duration: 0.2, ease: 'sine.inOut' })
      tl.to(bear, { rotation: 0, duration: 0.16, ease: 'sine.in' })
      this.track(tl)
      // Resize-during-intro can kill the tween before onComplete fires, leaving
      // the awaiter stuck — guarantee resolution after the nominal duration.
      setTimeout(finish, 1500)
    })
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
