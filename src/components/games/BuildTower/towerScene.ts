// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { COLOR, SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { prefersReducedMotion } from '@/utils/motion'
import { TOWER_SCENE_H, TOWER_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline
type PickHandler = (value: number) => void

interface BlockSprite {
  value: number
  container: Container
  placed: boolean
}

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const GROUND_H = 60
const GROUND_Y = TOWER_SCENE_H - GROUND_H
const BLOCK_W = 124
const BLOCK_H = 64
const STACK_GAP = 4
const TRAY_GAP = 26
const TRAY_Y = 116
const RADIUS = 14
const PALETTE = [COLOR.coral, COLOR.sky, COLOR.leaf, COLOR.grape, COLOR.primary]

// בנה את המגדל scene: scrambled numbered blocks rest on the ground; tapping them
// in order lifts each onto a growing tower with a bounce and a dust puff. Same
// crash-safe rules as the other scenes: markRaw the instance in the component,
// track every tween, and never destroy a display object inside a GSAP callback
// (debris is collected and destroyed on the next round / teardown).
export class TowerScene {
  private app: Application | null = null
  private blocks: BlockSprite[] = []
  private placedCount = 0
  private onPick: PickHandler | null = null
  private readonly debris: Graphics[] = []
  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: TOWER_SCENE_W,
      height: TOWER_SCENE_H,
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
    const sky = new Graphics()
    const bandHeight = TOWER_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.skyTop, SCENE.skyBottom, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, TOWER_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)

    this.buildClouds()
    this.buildSun()

    this.app.stage.addChild(
      new Graphics().ellipse(180, GROUND_Y + 30, 320, 120).fill({ color: SCENE.hillFar })
    )
    this.app.stage.addChild(
      new Graphics().ellipse(720, GROUND_Y + 40, 360, 130).fill({ color: SCENE.hillNear })
    )
    this.app.stage.addChild(
      new Graphics().rect(0, GROUND_Y, TOWER_SCENE_W, GROUND_H).fill({ color: SCENE.grass })
    )

    const plateW = BLOCK_W + 36
    const plate = new Graphics()
      .roundRect(TOWER_SCENE_W / 2 - plateW / 2, GROUND_Y - 12, plateW, 22, 8)
      .fill({ color: SCENE.tie })
    this.app.stage.addChild(plate)
  }

  private buildSun(): void {
    if (!this.app) return
    const sun = new Container()
    const glow = new Graphics().circle(0, 0, 86).fill({ color: SCENE.sun })
    glow.alpha = 0.22
    const rays = new Container()
    for (let i = 0; i < 8; i++) {
      const ray = new Graphics().roundRect(-5, -80, 10, 30, 5).fill({ color: SCENE.sun })
      ray.alpha = 0.55
      ray.rotation = (Math.PI / 4) * i
      rays.addChild(ray)
    }
    const disc = new Graphics().circle(0, 0, 52).fill({ color: SCENE.sun })
    const shine = new Graphics().circle(-16, -16, 22).fill({ color: lerpColor(SCENE.sun, COLOR.white, 0.6) })
    shine.alpha = 0.7
    sun.addChild(glow, rays, disc, shine)
    sun.position.set(TOWER_SCENE_W - 120, 100)
    this.app.stage.addChild(sun)
    if (!prefersReducedMotion()) {
      this.track(gsap.to(rays, { rotation: Math.PI * 2, duration: 38, repeat: -1, ease: 'none' }))
      this.track(gsap.to(glow.scale, { x: 1.14, y: 1.14, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    }
  }

  private buildClouds(): void {
    if (!this.app) return
    const specs: [number, number, number][] = [
      [170, 78, 0.92],
      [470, 54, 0.72],
      [640, 150, 0.6]
    ]
    for (const [x, y, scale] of specs) {
      const cloud = this.makeCloud()
      cloud.position.set(x, y)
      cloud.scale.set(scale)
      this.app.stage.addChild(cloud)
      if (!prefersReducedMotion()) {
        this.track(gsap.to(cloud, { x: x + 34, duration: 9 + x % 5, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
      }
    }
  }

  private makeCloud(): Container {
    const cloud = new Container()
    const puffs: [number, number, number][] = [
      [-34, 8, 26],
      [0, -8, 34],
      [32, 6, 24],
      [-4, 14, 30]
    ]
    for (const [px, py, r] of puffs) cloud.addChild(new Graphics().circle(px, py, r).fill({ color: SCENE.white }))
    cloud.alpha = 0.92
    cloud.filters = [new DropShadowFilter({ alpha: 0.08, blur: 4 })]
    return cloud
  }

  private makeBlock(value: number, color: string): Container {
    const container = new Container()
    const top = lerpColor(color, COLOR.white, 0.42)
    const bottom = lerpColor(color, COLOR.ink, 0.28)

    const base = new Graphics().roundRect(-BLOCK_W / 2, -BLOCK_H / 2, BLOCK_W, BLOCK_H, RADIUS).fill({ color })
    const shade = new Graphics()
      .roundRect(-BLOCK_W / 2, BLOCK_H / 2 - 16, BLOCK_W, 16, RADIUS)
      .fill({ color: bottom })
    const highlight = new Graphics()
      .roundRect(-BLOCK_W / 2 + 8, -BLOCK_H / 2 + 7, BLOCK_W - 16, BLOCK_H * 0.34, 9)
      .fill({ color: top })
    highlight.alpha = 0.85

    const label = new Text({
      text: String(value),
      style: { fontFamily: FONT, fontSize: 40, fontWeight: '700', fill: COLOR.white }
    })
    label.anchor.set(0.5)

    container.addChild(base, shade, highlight, label)
    container.filters = [new DropShadowFilter({ alpha: 0.32, blur: 3 })]
    container.pivot.set(0, 0)
    return container
  }

  private clearRound(): void {
    for (const block of this.blocks) block.container.destroy({ children: true })
    this.blocks = []
    this.clearDebris()
  }

  private clearDebris(): void {
    for (const piece of this.debris) piece.destroy()
    this.debris.length = 0
  }

  setRound(blocks: number[], onPick: PickHandler): void {
    if (!this.app) return
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.clearRound()
    this.onPick = onPick
    this.placedCount = 0

    const total = blocks.length * BLOCK_W + (blocks.length - 1) * TRAY_GAP
    const startX = (TOWER_SCENE_W - total) / 2 + BLOCK_W / 2

    blocks.forEach((value, i) => {
      const container = this.makeBlock(value, PALETTE[i % PALETTE.length])
      container.position.set(startX + i * (BLOCK_W + TRAY_GAP), TRAY_Y)
      container.eventMode = 'static'
      container.cursor = 'pointer'
      container.on('pointertap', () => this.onPick?.(value))
      this.app?.stage.addChild(container)
      this.blocks.push({ value, container, placed: false })

      if (!prefersReducedMotion()) {
        this.track(
          gsap.to(container, {
            y: TRAY_Y + 7,
            duration: 1.6 + i * 0.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })
        )
      }
    })
  }

  // Lift a block from the tray onto the next slot of the tower; resolves once it
  // lands. The bobbing tween is killed so the block sits still on the stack.
  placeBlock(value: number): Promise<void> {
    return new Promise((resolve) => {
      const block = this.blocks.find((entry) => entry.value === value && !entry.placed)
      if (!block) {
        resolve()
        return
      }
      block.placed = true
      block.container.eventMode = 'none'
      block.container.cursor = 'default'
      gsap.killTweensOf(block.container)

      const slot = this.placedCount++
      const targetX = TOWER_SCENE_W / 2
      const targetY = GROUND_Y - BLOCK_H / 2 - slot * (BLOCK_H + STACK_GAP)
      const peakY = Math.min(block.container.y, targetY) - 90

      const timeline = gsap.timeline({
        onComplete: () => {
          this.dustBurst(targetX, targetY + BLOCK_H / 2)
          resolve()
        }
      })
      timeline.to(block.container, { x: targetX, duration: 0.4, ease: 'power1.inOut' })
      timeline.to(block.container, { y: peakY, duration: 0.2, ease: 'power2.out' }, 0)
      timeline.to(block.container, { y: targetY, duration: 0.28, ease: 'bounce.out' }, 0.2)
      timeline.to(block.container.scale, { y: 0.82, x: 1.1, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' }, 0.46)
      this.track(timeline)
    })
  }

  private dustBurst(x: number, y: number): void {
    if (!this.app) return
    for (let i = 0; i < 9; i++) {
      const piece = new Graphics().circle(0, 0, 3 + Math.random() * 4).fill({ color: SCENE.steam })
      piece.position.set(x + (Math.random() - 0.5) * 40, y)
      piece.alpha = 0.9
      this.app.stage.addChild(piece)
      this.debris.push(piece)
      const dx = (Math.random() - 0.5) * 120
      this.track(
        gsap.to(piece, {
          x: piece.x + dx,
          y: y - 20 - Math.random() * 30,
          alpha: 0,
          duration: 0.5 + Math.random() * 0.2,
          ease: 'power2.out'
        })
      )
    }
  }

  wrong(value: number): void {
    const block = this.blocks.find((entry) => entry.value === value && !entry.placed)
    if (!block) return
    this.track(
      gsap.to(block.container, {
        rotation: 0.12,
        duration: 0.08,
        yoyo: true,
        repeat: 3,
        ease: 'sine.inOut'
      })
    )
  }

  celebrate(): void {
    const placed = this.blocks.filter((entry) => entry.placed)
    placed.forEach((block, i) => {
      this.track(
        gsap.to(block.container, {
          y: block.container.y - 16,
          duration: 0.22,
          delay: i * 0.06,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        })
      )
    })
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.clearRound()
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
