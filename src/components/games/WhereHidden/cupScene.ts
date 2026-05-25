// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { CONFETTI_COLORS, SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { CUP_COUNT, SHUFFLE_SCENE_H, SHUFFLE_SCENE_W } from '@/constants/gameConfig'
import type { ShuffleRound } from '@/utils/cupShuffle'

type Anim = gsap.core.Tween | gsap.core.Timeline
type PickHandler = (slot: number) => void

const BANDS = 12
const SKY_TOP = '#fff4e0'
const SKY_BOTTOM = '#ffe6c6'
const BASE_Y = SHUFFLE_SCENE_H * 0.58
const LIFT = 104
const CUP_H = 112
const CUP = SCENE.trainBody
const CUP_DARK = lerpColor(CUP, '#000000', 0.22)
const CUP_LIGHT = lerpColor(CUP, '#ffffff', 0.5)
const WOOD = SCENE.rail
const WOOD_TOP = lerpColor(WOOD, '#ffffff', 0.22)
const WOOD_DARK = lerpColor(WOOD, '#000000', 0.28)

interface Cup {
  container: Container
  slot: number
}

// איפה הסתתר scene: a polished shell game — the ball drops under a cup, the
// cups cross over each other in a paced shuffle, then the child taps to find
// it. markRaw in the component; tracked tweens; finished particles are retired
// (hidden + collected) and destroyed between rounds, never inside a callback.
export class CupScene {
  private app: Application | null = null
  private cups: Cup[] = []
  private ball: Graphics | null = null
  private readonly slotX: number[] = []
  private onPick: PickHandler | null = null
  private canPick = false

  private readonly tweens = new Set<Anim>()
  private timeline: Anim | null = null
  private spent: Container[] = []

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private retire(obj: Container, anim: Anim): void {
    this.tweens.delete(anim)
    anim.kill()
    obj.visible = false
    this.spent.push(obj)
  }

  private destroySpent(): void {
    for (const obj of this.spent) obj.destroy()
    this.spent = []
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: SHUFFLE_SCENE_W,
      height: SHUFFLE_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.buildBallAndCups()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = SHUFFLE_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, SHUFFLE_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)

    // Warm spotlight focusing attention on the cups.
    const spot = new Graphics().ellipse(SHUFFLE_SCENE_W / 2, BASE_Y - 30, 360, 200).fill({ color: '#ffffff', alpha: 0.35 })
    this.app.stage.addChild(spot)

    // Wooden table.
    const table = new Graphics()
    table.roundRect(46, BASE_Y, SHUFFLE_SCENE_W - 92, 84, 16).fill({ color: WOOD })
    table.roundRect(46, BASE_Y, SHUFFLE_SCENE_W - 92, 20, 16).fill({ color: WOOD_TOP })
    table.roundRect(46, BASE_Y + 70, SHUFFLE_SCENE_W - 92, 16, 8).fill({ color: WOOD_DARK })
    this.app.stage.addChild(table)

    const span = SHUFFLE_SCENE_W - 320
    const step = CUP_COUNT > 1 ? span / (CUP_COUNT - 1) : 0
    for (let k = 0; k < CUP_COUNT; k++) {
      this.slotX.push(160 + k * step)
    }
  }

  private buildBallAndCups(): void {
    if (!this.app) return
    const ball = new Graphics().circle(0, -18, 20).fill({ color: SCENE.sun })
    ball.circle(-6, -25, 6).fill({ color: '#ffffff', alpha: 0.7 })
    ball.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    ball.position.set(this.slotX[0], BASE_Y)
    ball.alpha = 0
    this.app.stage.addChild(ball)
    this.ball = ball

    for (let k = 0; k < CUP_COUNT; k++) {
      const container = new Container()
      container.addChild(this.drawCup())
      container.filters = [new DropShadowFilter({ alpha: 0.3, blur: 4 })]
      container.position.set(this.slotX[k], BASE_Y)
      container.eventMode = 'none'
      container.cursor = 'pointer'
      const cupRef: Cup = { container, slot: k }
      container.on('pointertap', () => {
        if (this.canPick) this.onPick?.(cupRef.slot)
      })
      this.app.stage.addChild(container)
      this.cups.push(cupRef)
    }
  }

  private drawCup(): Graphics {
    const g = new Graphics()
    g.ellipse(0, 6, 46, 10).fill({ color: SCENE.wheel, alpha: 0.14 }) // ground shadow
    g.poly([-44, 0, 44, 0, 27, -CUP_H, -27, -CUP_H]).fill({ color: CUP }) // body
    g.poly([-44, 0, 44, 0, 39, -26, -39, -26]).fill({ color: CUP_DARK, alpha: 0.55 }) // bottom shading
    g.poly([-32, -10, -23, -10, -15, -CUP_H + 10, -24, -CUP_H + 10]).fill({ color: CUP_LIGHT, alpha: 0.7 }) // gloss
    g.ellipse(0, -CUP_H, 27, 9).fill({ color: CUP_LIGHT }) // top rim
    g.circle(0, -CUP_H - 8, 7).fill({ color: CUP_DARK }) // knob
    return g
  }

  private cupAtSlot(slot: number): Cup | undefined {
    return this.cups.find((cup) => cup.slot === slot)
  }

  setRound(round: ShuffleRound, onPick: PickHandler): void {
    this.onPick = onPick
    this.canPick = false
    this.timeline?.kill()
    this.destroySpent()

    this.cups.forEach((cup, index) => {
      cup.slot = index
      cup.container.position.set(this.slotX[index], BASE_Y)
      cup.container.rotation = 0
      cup.container.eventMode = 'none'
    })
    if (this.ball) {
      this.ball.alpha = 0
      this.ball.position.set(this.slotX[round.startSlot], BASE_Y)
    }

    const introCup = this.cups[round.startSlot]
    const timeline = gsap.timeline()

    // Lift the start cup, drop the ball under it with a bounce, hold, cover.
    timeline.to(introCup.container, { y: BASE_Y - LIFT, duration: 0.45, ease: 'back.out(1.5)' })
    if (this.ball) {
      timeline.fromTo(this.ball, { y: -120, alpha: 1 }, { y: 0, duration: 0.5, ease: 'bounce.out' }, '<0.15')
    }
    timeline.to({}, { duration: 0.9 }) // hold so the child registers the spot
    if (this.ball) timeline.to(this.ball, { alpha: 0, duration: 0.12 })
    timeline.to(introCup.container, { y: BASE_Y, duration: 0.28, ease: 'power2.in' }, '<')
    timeline.to({}, { duration: 0.25 })

    // Shuffle: cups cross over each other, ramping slightly faster each swap.
    const slotToCup = this.cups.map((_, index) => index)
    round.swaps.forEach(([i, j], step) => {
      const cupA = this.cups[slotToCup[i]]
      const cupB = this.cups[slotToCup[j]]
      const dur = Math.max(0.4, 0.62 - step * 0.04)
      timeline.call(() => this.app?.stage.addChild(cupA.container)) // crossing cup in front
      timeline.to(cupA.container, { x: this.slotX[j], duration: dur, ease: 'power1.inOut' }, '<')
      timeline.to(cupB.container, { x: this.slotX[i], duration: dur, ease: 'power1.inOut' }, '<')
      timeline.to(cupA.container, { y: BASE_Y - 40, duration: dur / 2, ease: 'sine.out' }, '<')
      timeline.to(cupA.container, { y: BASE_Y, duration: dur / 2, ease: 'sine.in' }, '>')
      timeline.to({}, { duration: 0.06 })
      ;[slotToCup[i], slotToCup[j]] = [slotToCup[j], slotToCup[i]]
    })

    timeline.eventCallback('onComplete', () => {
      slotToCup.forEach((cupIndex, slot) => {
        this.cups[cupIndex].slot = slot
        this.cups[cupIndex].container.eventMode = 'static'
      })
      this.canPick = true
    })

    this.timeline = timeline
    this.track(timeline)
  }

  // Correct pick: lift the cup, hop the ball up under it, sparkle.
  revealWin(slot: number): void {
    this.canPick = false
    this.cups.forEach((cup) => (cup.container.eventMode = 'none'))
    const picked = this.cupAtSlot(slot)
    if (picked) this.track(gsap.to(picked.container, { y: BASE_Y - LIFT, duration: 0.4, ease: 'back.out(1.6)' }))
    if (this.ball) {
      this.app?.stage.addChild(this.ball) // ensure the ball is visible above the table
      this.ball.position.set(this.slotX[slot], BASE_Y)
      this.ball.alpha = 1
      this.track(gsap.fromTo(this.ball, { y: 0 }, { y: -22, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.out' }))
      this.sparkle(this.slotX[slot], BASE_Y - 18)
    }
  }

  // Wrong pick: lift the empty cup with a little "no" wobble, then lower it.
  peekEmpty(slot: number): void {
    if (!this.canPick) return
    this.canPick = false
    const cup = this.cupAtSlot(slot)
    if (!cup) {
      this.canPick = true
      return
    }
    const timeline = gsap.timeline({ onComplete: () => (this.canPick = true) })
    timeline.to(cup.container, { y: BASE_Y - LIFT, duration: 0.3, ease: 'back.out(1.4)' })
    timeline.to(cup.container, { rotation: -0.12, duration: 0.1, yoyo: true, repeat: 3, ease: 'sine.inOut' })
    timeline.to(cup.container, { rotation: 0, duration: 0.05 })
    timeline.to(cup.container, { y: BASE_Y, duration: 0.26, ease: 'power2.in' })
    this.track(timeline)
  }

  private sparkle(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const bit = new Graphics().circle(0, 0, 6).fill({ color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] })
      bit.position.set(x, y)
      this.app?.stage.addChild(bit)
      const angle = (i / 12) * Math.PI * 2
      const tween: Anim = gsap.to(bit, {
        x: x + Math.cos(angle) * 120,
        y: y + Math.sin(angle) * 120,
        alpha: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => this.retire(bit, tween)
      })
      this.track(tween)
    }
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.timeline = null
    this.cups = []
    this.ball = null
    this.spent = []
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
