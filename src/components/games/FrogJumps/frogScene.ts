// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { FROG_MAX, FROG_SCENE_H, FROG_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline
type PickHandler = (n: number) => void

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const PAD_R = 24
const LINE_Y = FROG_SCENE_H * 0.66
const FROG_Y = LINE_Y - 52
const MARGIN = 70

// קפיצות צפרדע scene: a number-line of lily pads and a frog that hops along it.
// Same crash-safe rules as the other scenes (markRaw in the component, tracked
// tweens; nothing is created-then-destroyed mid-round here).
export class FrogScene {
  private app: Application | null = null
  private readonly padX: number[] = []
  private pads: Container[] = []
  private frog: Text | null = null
  private equation: Text | null = null
  private currentIndex = 0
  private onPick: PickHandler | null = null

  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: FROG_SCENE_W,
      height: FROG_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.buildNumberLine()
    this.buildFrogAndEquation()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = FROG_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.skyTop, SCENE.skyBottom, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, FROG_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)
    this.app.stage.addChild(
      new Graphics().rect(0, FROG_SCENE_H - 70, FROG_SCENE_W, 70).fill({ color: SCENE.grass })
    )
  }

  private buildNumberLine(): void {
    if (!this.app) return
    const span = FROG_SCENE_W - MARGIN * 2
    const step = span / FROG_MAX
    for (let n = 0; n <= FROG_MAX; n++) {
      this.padX.push(MARGIN + n * step)
    }

    // The line connecting the pads.
    this.app.stage.addChild(
      new Graphics().roundRect(MARGIN - 8, LINE_Y - 4, span + 16, 8, 4).fill({ color: SCENE.rail })
    )

    for (let n = 0; n <= FROG_MAX; n++) {
      const pad = new Container()
      const lily = new Graphics().circle(0, 0, PAD_R).fill({ color: SCENE.leaf })
      lily.circle(0, 0, PAD_R - 6).fill({ color: SCENE.leafDeep })
      const label = new Text({ text: String(n), style: { fontFamily: FONT, fontSize: 22, fontWeight: '700', fill: SCENE.white } })
      label.anchor.set(0.5)
      pad.addChild(lily, label)
      pad.position.set(this.padX[n], LINE_Y)
      pad.eventMode = 'static'
      pad.cursor = 'pointer'
      const value = n
      pad.on('pointertap', () => this.onPick?.(value))
      this.app.stage.addChild(pad)
      this.pads.push(pad)
    }
  }

  private buildFrogAndEquation(): void {
    if (!this.app) return
    const frog = new Text({ text: '🐸', style: { fontFamily: FONT, fontSize: 72 } })
    frog.anchor.set(0.5)
    frog.position.set(this.padX[0], FROG_Y)
    frog.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(frog)
    this.frog = frog

    const equation = new Text({ text: '', style: { fontFamily: FONT, fontSize: 50, fontWeight: '700', fill: SCENE.letterInk } })
    equation.anchor.set(0.5)
    equation.position.set(FROG_SCENE_W / 2, 50)
    this.app.stage.addChild(equation)
    this.equation = equation
  }

  setRound(start: number, add: number, onPick: PickHandler): void {
    this.onPick = onPick
    this.currentIndex = start
    this.frog?.position.set(this.padX[start], FROG_Y)
    if (this.equation) this.equation.text = `${start} + ${add} = ?`
  }

  // Hop the frog one pad at a time up to the target; resolves when it lands.
  hopTo(target: number): Promise<void> {
    return new Promise((resolve) => {
      const frog = this.frog
      if (!frog || target <= this.currentIndex) {
        resolve()
        return
      }
      const timeline = gsap.timeline({ onComplete: () => resolve() })
      for (let n = this.currentIndex + 1; n <= target; n++) {
        timeline.to(frog, { x: this.padX[n], duration: 0.34, ease: 'power1.inOut' })
        timeline.to(frog, { y: FROG_Y - 46, duration: 0.17, ease: 'power1.out' }, '<')
        timeline.to(frog, { y: FROG_Y, duration: 0.17, ease: 'power1.in' }, '>')
      }
      this.currentIndex = target
      this.track(timeline)
    })
  }

  wrongPad(n: number): void {
    const pad = this.pads[n]
    if (!pad) return
    this.track(gsap.to(pad.scale, { x: 1.2, y: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' }))
  }

  cheer(): void {
    if (!this.frog) return
    const frog = this.frog
    const baseY = frog.y
    this.track(gsap.to(frog.scale, { x: 1.22, y: 1.22, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }))
    this.track(gsap.to(frog, { y: baseY - 28, duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.out' }))
  }

  // One-shot opening animation: frog drops in from above with a bounce, squashes
  // and stretches on landing. Resolves so the game can wire the pick handler.
  intro(): Promise<void> {
    const frog = this.frog
    if (!frog) return Promise.resolve()
    const finalY = FROG_Y
    frog.y = -60
    frog.scale.set(1)
    return new Promise<void>((resolve) => {
      let done = false
      const finish = (): void => {
        if (done) return
        done = true
        resolve()
      }
      const tl = gsap.timeline({ onComplete: finish })
      tl.to(frog, { y: finalY, duration: 0.55, ease: 'bounce.out' })
      tl.to(frog.scale, { x: 1.22, y: 0.82, duration: 0.1, ease: 'sine.out' })
      tl.to(frog.scale, { x: 1, y: 1, duration: 0.18, ease: 'back.out(1.8)' })
      this.track(tl)
      setTimeout(finish, 1400)
    })
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.pads = []
    this.frog = null
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
