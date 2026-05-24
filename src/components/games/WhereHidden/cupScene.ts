// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { CUP_COUNT, SHUFFLE_SCENE_H, SHUFFLE_SCENE_W } from '@/constants/gameConfig'
import type { ShuffleRound } from '@/utils/cupShuffle'

type Anim = gsap.core.Tween | gsap.core.Timeline
type PickHandler = (slot: number) => void

const BANDS = 12
const SKY_TOP = '#eaf6ff'
const SKY_BOTTOM = '#fbeffe'
const BASE_Y = SHUFFLE_SCENE_H * 0.6
const LIFT = 96
const CUP_H = 104

interface Cup {
  container: Container
  slot: number
}

// איפה הסתתר scene: a shell game. The ball is shown under a cup, the cups
// shuffle, then the child taps a cup. Same crash-safe rules as the other
// scenes (markRaw in the component, tracked tweens).
export class CupScene {
  private app: Application | null = null
  private cups: Cup[] = []
  private ball: Graphics | null = null
  private readonly slotX: number[] = []
  private onPick: PickHandler | null = null
  private canPick = false

  private readonly tweens = new Set<Anim>()
  private timeline: Anim | null = null

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
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
    this.app.stage.addChild(
      new Graphics().roundRect(60, BASE_Y + 6, SHUFFLE_SCENE_W - 120, 16, 8).fill({ color: SCENE.rail })
    )

    const span = SHUFFLE_SCENE_W - 320
    const step = CUP_COUNT > 1 ? span / (CUP_COUNT - 1) : 0
    for (let k = 0; k < CUP_COUNT; k++) {
      this.slotX.push(160 + k * step)
    }
  }

  private buildBallAndCups(): void {
    if (!this.app) return
    const ball = new Graphics().circle(0, -16, 18).fill({ color: SCENE.trainBody })
    ball.circle(-5, -22, 5).fill({ color: '#ffffff', alpha: 0.6 })
    ball.position.set(this.slotX[0], BASE_Y)
    ball.alpha = 0
    this.app.stage.addChild(ball)
    this.ball = ball

    for (let k = 0; k < CUP_COUNT; k++) {
      const container = new Container()
      const cup = new Graphics()
      cup.poly([-44, 0, 44, 0, 27, -CUP_H, -27, -CUP_H]).fill({ color: SCENE.trainCar })
      cup.ellipse(0, -CUP_H, 27, 9).fill({ color: SCENE.trainWindow })
      cup.ellipse(0, 0, 44, 11).fill({ color: SCENE.trainRoof, alpha: 0.3 })
      container.addChild(cup)
      container.filters = [new DropShadowFilter({ alpha: 0.28, blur: 3 })]
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

  private cupAtSlot(slot: number): Cup | undefined {
    return this.cups.find((cup) => cup.slot === slot)
  }

  setRound(round: ShuffleRound, onPick: PickHandler): void {
    this.onPick = onPick
    this.canPick = false
    this.timeline?.kill()

    this.cups.forEach((cup, index) => {
      cup.slot = index
      cup.container.position.set(this.slotX[index], BASE_Y)
      cup.container.eventMode = 'none'
    })
    if (this.ball) {
      this.ball.alpha = 0
      this.ball.position.set(this.slotX[round.startSlot], BASE_Y)
    }

    const introCup = this.cups[round.startSlot]
    const timeline = gsap.timeline()

    // Show the ball under its cup, then cover it.
    timeline.to(introCup.container, { y: BASE_Y - LIFT, duration: 0.4, ease: 'back.out(1.4)' })
    if (this.ball) timeline.to(this.ball, { alpha: 1, duration: 0.2 }, '<0.15')
    timeline.to({}, { duration: 0.7 })
    if (this.ball) timeline.to(this.ball, { alpha: 0, duration: 0.15 })
    timeline.to(introCup.container, { y: BASE_Y, duration: 0.3, ease: 'power1.in' }, '<')

    // Shuffle: simulate the slot map as we build so we know which cup moves.
    const slotToCup = this.cups.map((_, index) => index)
    for (const [i, j] of round.swaps) {
      const cupA = this.cups[slotToCup[i]]
      const cupB = this.cups[slotToCup[j]]
      timeline.to(cupA.container, { x: this.slotX[j], duration: 0.5, ease: 'power1.inOut' })
      timeline.to(cupB.container, { x: this.slotX[i], duration: 0.5, ease: 'power1.inOut' }, '<')
      timeline.to(cupA.container, { y: BASE_Y - 22, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.out' }, '<')
      ;[slotToCup[i], slotToCup[j]] = [slotToCup[j], slotToCup[i]]
    }

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

  // Lift the tapped cup (and the ball's cup if different) and show the ball.
  reveal(pickedSlot: number, ballSlot: number): void {
    this.canPick = false
    this.cups.forEach((cup) => (cup.container.eventMode = 'none'))
    if (this.ball) {
      this.ball.position.set(this.slotX[ballSlot], BASE_Y)
      this.ball.alpha = 1
    }
    const picked = this.cupAtSlot(pickedSlot)
    if (picked) this.track(gsap.to(picked.container, { y: BASE_Y - LIFT, duration: 0.35, ease: 'back.out(1.4)' }))
    if (pickedSlot !== ballSlot) {
      const ballCup = this.cupAtSlot(ballSlot)
      if (ballCup) this.track(gsap.to(ballCup.container, { y: BASE_Y - LIFT, duration: 0.35, ease: 'back.out(1.4)' }))
    }
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.timeline = null
    this.cups = []
    this.ball = null
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
