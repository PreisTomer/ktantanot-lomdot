// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { FederatedPointerEvent } from 'pixi.js'
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
const PLATE_RX = 160
const ORIGIN_A = { x: 150, y: BEAR_SCENE_H * 0.74 }
const ORIGIN_B = { x: BEAR_SCENE_W - 150, y: BEAR_SCENE_H * 0.74 }

interface Bunch {
  container: Container
  origin: { x: number; y: number }
  rest: { x: number; y: number }
  delivered: boolean
}

// המסעדה של הדוב scene: drag two cake bunches onto the bear's plate to combine
// them. Same crash-safe rules (markRaw in the component, tracked tweens; the
// bunches are rebuilt each round, never destroyed inside a GSAP callback).
export class BearScene {
  private app: Application | null = null
  private bear: Text | null = null
  private equation: Text | null = null
  private bunches: Bunch[] = []
  private dragTarget: Bunch | null = null
  private readonly dragOffset = { x: 0, y: 0 }
  private deliveredCount = 0
  private onReady: (() => void) | null = null

  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
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
    app.stage.eventMode = 'static'
    app.stage.hitArea = new Rectangle(0, 0, BEAR_SCENE_W, BEAR_SCENE_H)
    app.stage.on('pointermove', (event) => this.onDragMove(event))
    app.stage.on('pointerup', () => this.onDragEnd())
    app.stage.on('pointerupoutside', () => this.onDragEnd())
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

    // Counter the bear stands behind.
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

    // The plate (drop target).
    const plate = new Graphics()
    plate.ellipse(PLATE_X, PLATE_Y, PLATE_RX, 58).fill({ color: SCENE.white })
    plate.ellipse(PLATE_X, PLATE_Y, PLATE_RX - 16, 46).fill({ color: SCENE.trainWindow })
    this.app.stage.addChild(plate)
  }

  setRound(a: number, b: number, onReady: () => void): void {
    this.onReady = onReady
    this.deliveredCount = 0
    this.dragTarget = null
    for (const bunch of this.bunches) bunch.container.destroy()
    this.bunches = []
    if (this.equation) this.equation.text = `${a} + ${b} = ?`

    this.bunches.push(this.buildBunch(a, ORIGIN_A, { x: PLATE_X - 64, y: PLATE_Y - 16 }))
    this.bunches.push(this.buildBunch(b, ORIGIN_B, { x: PLATE_X + 64, y: PLATE_Y - 16 }))
  }

  private buildBunch(count: number, origin: { x: number; y: number }, rest: { x: number; y: number }): Bunch {
    if (!this.app) {
      return { container: new Container(), origin, rest, delivered: false }
    }
    const container = new Container()
    const perRow = 3
    for (let i = 0; i < count; i++) {
      const cake = new Text({ text: '🧁', style: { fontFamily: FONT, fontSize: 40 } })
      cake.anchor.set(0.5)
      const col = i % perRow
      const row = Math.floor(i / perRow)
      cake.position.set((col - (Math.min(count, perRow) - 1) / 2) * 38, -row * 36)
      container.addChild(cake)
    }
    container.position.set(origin.x, origin.y)
    container.filters = [new DropShadowFilter({ alpha: 0.25, blur: 2 })]
    container.eventMode = 'static'
    container.cursor = 'grab'
    const bunch: Bunch = { container, origin, rest, delivered: false }
    container.on('pointerdown', (event) => this.onDragStart(bunch, event))
    this.app.stage.addChild(container)
    return bunch
  }

  private onDragStart(bunch: Bunch, event: FederatedPointerEvent): void {
    if (bunch.delivered) return
    this.dragTarget = bunch
    this.dragOffset.x = bunch.container.x - event.global.x
    this.dragOffset.y = bunch.container.y - event.global.y
    this.app?.stage.addChild(bunch.container) // bring to front
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return
    this.dragTarget.container.position.set(event.global.x + this.dragOffset.x, event.global.y + this.dragOffset.y)
  }

  private onDragEnd(): void {
    const bunch = this.dragTarget
    this.dragTarget = null
    if (!bunch) return
    const dx = bunch.container.x - PLATE_X
    const dy = bunch.container.y - PLATE_Y
    if (Math.abs(dx) <= PLATE_RX && Math.abs(dy) <= 120) {
      this.deliver(bunch)
    } else {
      this.track(gsap.to(bunch.container, { x: bunch.origin.x, y: bunch.origin.y, duration: 0.3, ease: 'power2.out' }))
    }
  }

  private deliver(bunch: Bunch): void {
    bunch.delivered = true
    bunch.container.eventMode = 'none'
    bunch.container.cursor = 'default'
    this.track(gsap.to(bunch.container, { x: bunch.rest.x, y: bunch.rest.y, duration: 0.3, ease: 'back.out(1.6)' }))
    this.deliveredCount += 1
    if (this.deliveredCount === this.bunches.length) {
      this.onReady?.()
    }
  }

  cheer(): void {
    if (!this.bear) return
    this.track(gsap.to(this.bear.scale, { x: 1.15, y: 1.15, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.bunches = []
    this.dragTarget = null
    this.bear = null
    this.equation = null
    this.onReady = null
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
