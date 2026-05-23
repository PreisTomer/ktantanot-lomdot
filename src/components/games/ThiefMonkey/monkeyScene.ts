// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { MONKEY_SCENE_H, MONKEY_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const PER_ROW = 5
const BANANA_GAP = 70
const CANOPY_CX = MONKEY_SCENE_W * 0.4
const CANOPY_CY = 150
const MONKEY_X = MONKEY_SCENE_W * 0.78
const MONKEY_Y = MONKEY_SCENE_H * 0.66

// הקוף הגנב scene: a banana tree, a thief monkey that steals some bananas, and
// the equation. Same crash-safe rules as the other scenes (markRaw in the
// component, tracked tweens, never destroy inside a GSAP callback).
export class MonkeyScene {
  private app: Application | null = null
  private readonly bananaLayer = new Container()
  private bananas: Text[] = []
  private monkey: Text | null = null
  private equation: Text | null = null

  private readonly tweens = new Set<Anim>()
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
      width: MONKEY_SCENE_W,
      height: MONKEY_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    app.stage.addChild(this.bananaLayer)
    this.buildMonkeyAndEquation()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = MONKEY_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.skyTop, SCENE.skyBottom, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, MONKEY_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)

    const ground = new Graphics()
      .rect(0, MONKEY_SCENE_H - 80, MONKEY_SCENE_W, 80)
      .fill({ color: SCENE.grass })
    this.app.stage.addChild(ground)

    // Tree: trunk + layered canopy behind the bananas.
    const tree = new Container()
    tree.addChild(new Graphics().roundRect(CANOPY_CX - 22, 150, 44, MONKEY_SCENE_H - 230, 16).fill({ color: SCENE.rail }))
    tree.addChild(new Graphics().ellipse(CANOPY_CX, CANOPY_CY, 260, 150).fill({ color: SCENE.hillFar }))
    tree.addChild(new Graphics().ellipse(CANOPY_CX - 120, CANOPY_CY + 20, 130, 100).fill({ color: SCENE.hillNear }))
    tree.addChild(new Graphics().ellipse(CANOPY_CX + 120, CANOPY_CY + 20, 130, 100).fill({ color: SCENE.hillNear }))
    this.app.stage.addChild(tree)
  }

  private buildMonkeyAndEquation(): void {
    if (!this.app) return
    const monkey = new Text({ text: '🐵', style: { fontFamily: FONT, fontSize: 130 } })
    monkey.anchor.set(0.5)
    monkey.position.set(MONKEY_X, MONKEY_Y)
    monkey.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(monkey)
    this.monkey = monkey

    const equation = new Text({
      text: '',
      style: { fontFamily: FONT, fontSize: 54, fontWeight: '700', fill: SCENE.letterInk }
    })
    equation.anchor.set(0.5)
    equation.position.set(MONKEY_SCENE_W / 2, MONKEY_SCENE_H - 44)
    this.app.stage.addChild(equation)
    this.equation = equation
  }

  private banana(): Text {
    const text = new Text({ text: '🍌', style: { fontFamily: FONT, fontSize: 50 } })
    text.anchor.set(0.5)
    return text
  }

  setRound(total: number, stolen: number): void {
    this.destroySpent()
    for (const banana of this.bananas) banana.destroy()
    this.bananas = []
    if (this.equation) this.equation.text = `${total} − ${stolen} = ?`

    const rows = Math.ceil(total / PER_ROW)
    let index = 0
    for (let r = 0; r < rows; r++) {
      const countInRow = Math.min(PER_ROW, total - r * PER_ROW)
      const rowW = (countInRow - 1) * BANANA_GAP
      const startX = CANOPY_CX - rowW / 2
      for (let c = 0; c < countInRow; c++) {
        const banana = this.banana()
        banana.position.set(startX + c * BANANA_GAP, CANOPY_CY - 30 + r * 60)
        banana.scale.set(0)
        this.bananaLayer.addChild(banana)
        this.bananas.push(banana)
        this.track(gsap.to(banana.scale, { x: 1, y: 1, duration: 0.3, delay: index * 0.05, ease: 'back.out(2)' }))
        index++
      }
    }

    this.scheduleSteal(total, stolen)
  }

  private scheduleSteal(total: number, stolen: number): void {
    const startDelay = total * 0.05 + 0.5
    this.track(gsap.delayedCall(startDelay, () => this.steal(stolen)))
  }

  private steal(stolen: number): void {
    const taken = this.bananas.slice(this.bananas.length - stolen)
    if (this.monkey) {
      this.track(gsap.to(this.monkey, { y: MONKEY_Y - 40, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' }))
    }
    taken.forEach((banana, i) => {
      const tween: Anim = gsap.to(banana, {
        x: MONKEY_X,
        y: MONKEY_Y,
        alpha: 0,
        duration: 0.5,
        delay: i * 0.18,
        ease: 'power2.in',
        onComplete: () => this.retire(banana, tween)
      })
      this.track(tween)
      this.track(gsap.to(banana.scale, { x: 0.4, y: 0.4, duration: 0.5, delay: i * 0.18, ease: 'power2.in' }))
    })
  }

  cheer(): void {
    if (!this.monkey) return
    this.track(gsap.to(this.monkey.scale, { x: 1.18, y: 1.18, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.bananas = []
    this.spent = []
    this.monkey = null
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
