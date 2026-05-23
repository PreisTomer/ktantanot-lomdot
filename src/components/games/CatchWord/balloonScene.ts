// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import type { Ticker } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { CONFETTI_COLORS } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { CATCH_SCENE_H, CATCH_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const SKY_TOP = '#cdeaff'
const SKY_BOTTOM = '#eef9ff'
const SKY_BANDS = 12
const BALLOON_R = 54
const RISE_MIN = 0.45
const RISE_MAX = 0.85
const SWAY_AMP = 32
const WRAP_MARGIN = 170

interface Balloon {
  container: Container
  word: string
  baseX: number
  speed: number
  phase: number
}

type TapHandler = (word: string) => void

// Encapsulates the WebGL balloon scene: a sky with rising, swaying word
// balloons that can be tapped, popped, or sent floating away. No Vue imports.
//
// Two rules keep GSAP and Pixi from crashing each other:
//  1. every animation is tracked by reference and killed explicitly (not via
//     the unreliable gsap.killTweensOf(pixiObject));
//  2. a Pixi object is NEVER destroyed inside a GSAP callback — finished ones
//     are hidden and collected, then destroyed on the next round / teardown,
//     when nothing is animating them.
export class BalloonScene {
  private app: Application | null = null
  private readonly cloudLayer = new Container()
  private readonly balloonLayer = new Container()
  private readonly particleLayer = new Container()
  private balloons: Balloon[] = []
  private spent: Container[] = []
  private onTap: TapHandler | null = null
  private elapsed = 0
  private paused = true
  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private retire(container: Container, anim: Anim): void {
    this.tweens.delete(anim)
    // Kill (not just untrack) so GSAP removes the finished animation from its
    // root and can never re-render it onto a later-destroyed Pixi object.
    anim.kill()
    container.visible = false
    this.spent.push(container)
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: CATCH_SCENE_W,
      height: CATCH_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    app.stage.addChild(this.cloudLayer, this.balloonLayer, this.particleLayer)
    app.ticker.add(this.tick)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = CATCH_SCENE_H / SKY_BANDS
    for (let i = 0; i < SKY_BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (SKY_BANDS - 1))
      sky.rect(0, i * bandHeight, CATCH_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChildAt(sky, 0)

    for (let i = 0; i < 3; i++) {
      const cloud = new Graphics()
      cloud.circle(0, 0, 28).circle(30, 8, 22).circle(-28, 10, 20).fill({ color: '#ffffff', alpha: 0.8 })
      cloud.position.set(140 + i * 300, 80 + (i % 2) * 60)
      this.cloudLayer.addChild(cloud)
      this.track(gsap.to(cloud, { x: cloud.x + 70, duration: 7 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    }
  }

  setRound(words: string[], onTap: TapHandler): void {
    this.onTap = onTap
    this.clearBalloons()
    const slot = CATCH_SCENE_W / (words.length + 1)
    words.forEach((word, index) => {
      const balloon = this.buildBalloon(word, index)
      balloon.baseX = slot * (index + 1)
      balloon.container.position.set(balloon.baseX, CATCH_SCENE_H * 0.45 + index * 90)
      this.balloonLayer.addChild(balloon.container)
      this.balloons.push(balloon)
    })
    this.paused = false
  }

  private buildBalloon(word: string, index: number): Balloon {
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
    const container = new Container()
    const body = new Graphics().ellipse(0, 0, BALLOON_R, BALLOON_R * 1.18).fill({ color })
    body.ellipse(-BALLOON_R * 0.34, -BALLOON_R * 0.42, BALLOON_R * 0.22, BALLOON_R * 0.3).fill({ color: '#ffffff', alpha: 0.5 })
    const knotY = BALLOON_R * 1.18
    const knot = new Graphics().poly([-8, knotY, 8, knotY, 0, knotY + 12]).fill({ color })
    const string = new Graphics()
      .moveTo(0, knotY + 12)
      .bezierCurveTo(16, knotY + 50, -16, knotY + 92, 6, knotY + 132)
      .stroke({ width: 2, color: '#ffffff', alpha: 0.7 })
    const text = new Text({ text: word, style: { fontFamily: FONT, fontSize: 28, fontWeight: '700', fill: '#ffffff' } })
    text.anchor.set(0.5)
    container.addChild(string, body, knot, text)
    container.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    container.eventMode = 'static'
    container.cursor = 'pointer'
    container.on('pointertap', () => this.onTap?.(word))
    return {
      container,
      word,
      baseX: 0,
      speed: RISE_MIN + Math.random() * (RISE_MAX - RISE_MIN),
      phase: Math.random() * Math.PI * 2
    }
  }

  private tick = (ticker: Ticker): void => {
    if (this.paused) return
    this.elapsed += ticker.deltaTime
    for (const balloon of this.balloons) {
      balloon.container.y -= balloon.speed * ticker.deltaTime
      balloon.container.x = balloon.baseX + Math.sin(this.elapsed * 0.02 + balloon.phase) * SWAY_AMP
      if (balloon.container.y < -WRAP_MARGIN) {
        balloon.container.y = CATCH_SCENE_H + WRAP_MARGIN
      }
    }
  }

  // A wrong balloon escapes: it shoots up fast, fades, and is gone for the
  // round (it does not wrap back in). Other balloons keep rising.
  floatAway(word: string): void {
    const index = this.balloons.findIndex((item) => item.word === word)
    if (index === -1) return
    const [balloon] = this.balloons.splice(index, 1)
    const container = balloon.container
    container.eventMode = 'none'
    const tween: Anim = gsap.to(container, {
      y: -WRAP_MARGIN * 1.6,
      alpha: 0,
      duration: 0.7,
      ease: 'power2.in',
      onComplete: () => this.retire(container, tween)
    })
    this.track(tween)
  }

  pop(word: string): Promise<void> {
    return new Promise((resolve) => {
      const index = this.balloons.findIndex((item) => item.word === word)
      if (index === -1) {
        resolve()
        return
      }
      const [balloon] = this.balloons.splice(index, 1)
      this.paused = true
      const container = balloon.container
      container.eventMode = 'none'
      this.burst(container.x, container.y, CONFETTI_COLORS[index % CONFETTI_COLORS.length])
      const tl: Anim = gsap.timeline({
        onComplete: () => {
          this.retire(container, tl)
          resolve()
        }
      })
      tl.to(container.scale, { x: 1.5, y: 1.5, duration: 0.32, ease: 'power2.out' }, 0)
      tl.to(container, { alpha: 0, duration: 0.32, ease: 'power1.in' }, 0)
      this.track(tl)
    })
  }

  private burst(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      const bit = new Graphics().circle(0, 0, 6).fill({ color })
      bit.position.set(x, y)
      this.particleLayer.addChild(bit)
      const angle = (i / 12) * Math.PI * 2
      const tween: Anim = gsap.to(bit, {
        x: x + Math.cos(angle) * 120,
        y: y + Math.sin(angle) * 120,
        alpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => this.retire(bit, tween)
      })
      this.track(tween)
    }
  }

  // Destroy retired/visible display objects here — outside any GSAP callback,
  // when nothing is animating them.
  private clearBalloons(): void {
    for (const balloon of this.balloons) {
      balloon.container.destroy()
    }
    this.balloons = []
    for (const container of this.spent) {
      container.destroy()
    }
    this.spent = []
  }

  destroy(): void {
    this.paused = true
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.balloons = []
    this.spent = []
    if (this.app) {
      this.app.ticker.remove(this.tick)
      try {
        this.app.destroy(true, { children: true, texture: true })
      } catch {
        // Renderer already torn down; nothing to clean up.
      }
    }
    this.app = null
  }
}
