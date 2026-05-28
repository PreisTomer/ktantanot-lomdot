// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const PER_ROW = 5
const BANANA_GAP = 70
const CANOPY_CY = 150

// הקוף הגנב scene: a banana tree, a thief monkey that steals some bananas, and
// the equation. Layout is driven by the canvas (w, h) so it fills a wide or a
// tall stage. Same crash-safe rules as the other scenes (markRaw in the
// component, tracked tweens, never destroy inside a GSAP callback).
export class MonkeyScene {
  private app: Application | null = null
  private readonly bananaLayer = new Container()
  private bananas: Text[] = []
  private monkey: Text | null = null
  private equation: Text | null = null
  private cover: Container | null = null
  private coverTween: Anim | null = null
  private w = 0
  private h = 0
  private total = 4
  private stolen = 1

  private readonly tweens = new Set<Anim>()
  private spent: Container[] = []

  private get canopyCx(): number {
    return this.w * 0.4
  }
  private get monkeyX(): number {
    return this.w * 0.78
  }
  private get monkeyY(): number {
    return this.h * 0.66
  }

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
    app.stage.addChild(this.bananaLayer)
    this.buildMonkeyAndEquation()
  }

  resize(width: number, height: number): void {
    if (!this.app) return
    this.w = width
    this.h = height
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.coverTween = null
    this.app.stage.removeChildren().forEach((child) => child.destroy({ children: true }))
    this.bananaLayer.removeChildren()
    this.bananas = []
    this.spent = []
    this.monkey = null
    this.equation = null
    this.cover = null
    this.app.renderer.resize(width, height)
    this.buildBackdrop()
    this.app.stage.addChild(this.bananaLayer)
    this.buildMonkeyAndEquation()
    this.setRound(this.total, this.stolen)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = this.h / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.skyTop, SCENE.skyBottom, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, this.w, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)

    const ground = new Graphics().rect(0, this.h - 80, this.w, 80).fill({ color: SCENE.grass })
    this.app.stage.addChild(ground)

    // Tree: trunk + layered canopy behind the bananas.
    const cx = this.canopyCx
    const tree = new Container()
    tree.addChild(new Graphics().roundRect(cx - 22, 150, 44, this.h - 230, 16).fill({ color: SCENE.rail }))
    tree.addChild(new Graphics().ellipse(cx, CANOPY_CY, 260, 150).fill({ color: SCENE.hillFar }))
    tree.addChild(new Graphics().ellipse(cx - 120, CANOPY_CY + 20, 130, 100).fill({ color: SCENE.hillNear }))
    tree.addChild(new Graphics().ellipse(cx + 120, CANOPY_CY + 20, 130, 100).fill({ color: SCENE.hillNear }))
    this.app.stage.addChild(tree)
  }

  private buildMonkeyAndEquation(): void {
    if (!this.app) return
    const monkey = new Text({ text: '🐵', style: { fontFamily: FONT, fontSize: 130 } })
    monkey.anchor.set(0.5)
    monkey.position.set(this.monkeyX, this.monkeyY)
    monkey.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(monkey)
    this.monkey = monkey

    const equation = new Text({
      text: '',
      style: { fontFamily: FONT, fontSize: 54, fontWeight: '700', fill: SCENE.letterInk }
    })
    equation.anchor.set(0.5)
    equation.position.set(this.w / 2, this.h - 44)
    this.app.stage.addChild(equation)
    this.equation = equation

    // Leafy cover that hides the remaining bananas so the child must subtract
    // rather than count what is left.
    const cover = new Container()
    cover.addChild(new Graphics().ellipse(0, 0, 180, 120).fill({ color: SCENE.hillNear }))
    cover.addChild(new Graphics().ellipse(-92, 18, 92, 72).fill({ color: SCENE.hillFar }))
    cover.addChild(new Graphics().ellipse(92, 18, 92, 72).fill({ color: SCENE.hillFar }))
    const question = new Text({ text: '?', style: { fontFamily: FONT, fontSize: 104, fontWeight: '700', fill: '#ffffff' } })
    question.anchor.set(0.5)
    cover.addChild(question)
    cover.position.set(this.canopyCx, CANOPY_CY + 8)
    cover.scale.set(0)
    cover.visible = false
    cover.filters = [new DropShadowFilter({ alpha: 0.25, blur: 3 })]
    this.app.stage.addChild(cover)
    this.cover = cover
  }

  private banana(): Text {
    const text = new Text({ text: '🍌', style: { fontFamily: FONT, fontSize: 50 } })
    text.anchor.set(0.5)
    return text
  }

  setRound(total: number, stolen: number): void {
    this.total = total
    this.stolen = stolen
    this.destroySpent()
    for (const banana of this.bananas) banana.destroy()
    this.bananas = []
    this.coverTween?.kill()
    if (this.cover) {
      this.cover.visible = false
      this.cover.scale.set(0)
    }
    if (this.equation) this.equation.text = `${total} − ${stolen} = ?`

    const rows = Math.ceil(total / PER_ROW)
    const cx = this.canopyCx
    let index = 0
    for (let r = 0; r < rows; r++) {
      const countInRow = Math.min(PER_ROW, total - r * PER_ROW)
      const rowW = (countInRow - 1) * BANANA_GAP
      const startX = cx - rowW / 2
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
    const startDelay = total * 0.05 + 0.6
    this.track(gsap.delayedCall(startDelay, () => this.steal(stolen)))
    const stealDuration = 0.5 + (stolen - 1) * 0.18
    this.track(gsap.delayedCall(startDelay + stealDuration + 0.25, () => this.showCover()))
  }

  private showCover(): void {
    if (!this.cover) return
    this.cover.visible = true
    this.coverTween = gsap.to(this.cover.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out(2)' })
    this.track(this.coverTween)
  }

  // Open the leaves to reveal the remaining bananas — confirms a correct answer.
  reveal(): void {
    if (!this.cover) return
    this.coverTween?.kill()
    this.coverTween = gsap.to(this.cover.scale, { x: 0, y: 0, duration: 0.3, ease: 'power2.in' })
    this.track(this.coverTween)
  }

  private steal(stolen: number): void {
    const taken = this.bananas.slice(this.bananas.length - stolen)
    const monkeyY = this.monkeyY
    if (this.monkey) {
      this.track(gsap.to(this.monkey, { y: monkeyY - 40, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' }))
    }
    taken.forEach((banana, i) => {
      const tween: Anim = gsap.to(banana, {
        x: this.monkeyX,
        y: monkeyY,
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
    const monkey = this.monkey
    const baseY = monkey.y
    this.track(gsap.to(monkey.scale, { x: 1.2, y: 1.2, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
    this.track(gsap.to(monkey, { y: baseY - 22, duration: 0.22, yoyo: true, repeat: 1, ease: 'sine.out' }))
  }

  // One-shot opening animation: monkey swings in from off-stage right with a
  // back-out ease, peeks once, then settles at its working position.
  intro(): Promise<void> {
    const monkey = this.monkey
    if (!monkey) return Promise.resolve()
    const finalX = this.monkeyX
    monkey.x = this.w + 100
    monkey.rotation = 0
    return new Promise<void>((resolve) => {
      let done = false
      const finish = (): void => {
        if (done) return
        done = true
        resolve()
      }
      const tl = gsap.timeline({ onComplete: finish })
      tl.to(monkey, { x: finalX, duration: 0.6, ease: 'back.out(1.6)' })
      tl.to(monkey, { rotation: -0.18, duration: 0.16, ease: 'sine.out' })
      tl.to(monkey, { rotation: 0.12, duration: 0.18, ease: 'sine.inOut' })
      tl.to(monkey, { rotation: 0, duration: 0.14, ease: 'sine.in' })
      this.track(tl)
      setTimeout(finish, 1600)
    })
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.bananas = []
    this.spent = []
    this.monkey = null
    this.equation = null
    this.cover = null
    this.coverTween = null
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
