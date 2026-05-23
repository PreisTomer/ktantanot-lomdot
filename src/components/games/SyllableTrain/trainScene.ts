// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter, GlowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { TRAIN_CAR, TRAIN_SCENE_H, TRAIN_SCENE_W } from '@/constants/gameConfig'
import type { WordCard } from '@/constants/words'

const FONT = 'Varela Round, Rubik, sans-serif'
const SKY_BANDS = 12
const TRACK_INSET = 95
const WHEEL_RADIUS = 16

function lerpColor(from: string, to: string, t: number): string {
  const a = parseInt(from.slice(1), 16)
  const b = parseInt(to.slice(1), 16)
  const ar = (a >> 16) & 255
  const ag = (a >> 8) & 255
  const ab = a & 255
  const br = (b >> 16) & 255
  const bg = (b >> 8) & 255
  const bb = b & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

// Encapsulates the WebGL train scene: backdrop, the assembling train, steam,
// and the reward picture. The Vue component drives it; no Vue imports here.
export class TrainScene {
  private app: Application | null = null
  private readonly hillLayer = new Container()
  private readonly cloudLayer = new Container()
  private readonly trainLayer = new Container()
  private readonly steamLayer = new Container()
  private pictureText: Text | null = null
  private emptyCar: Container | null = null
  private emptyCarBg: Graphics | null = null
  private locoTop = { x: 0, y: 0 }
  private readonly tweened: object[] = []

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: TRAIN_SCENE_W,
      height: TRAIN_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.trainLayer.filters = [new DropShadowFilter({ alpha: 0.35, blur: 3 })]
    app.stage.addChild(this.hillLayer, this.cloudLayer, this.trainLayer, this.steamLayer)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = TRAIN_SCENE_H / SKY_BANDS
    for (let i = 0; i < SKY_BANDS; i++) {
      const color = lerpColor(SCENE.skyTop, SCENE.skyBottom, i / (SKY_BANDS - 1))
      sky.rect(0, i * bandHeight, TRAIN_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)

    const sun = new Graphics().circle(0, 0, 46).fill({ color: SCENE.sun })
    sun.filters = [new GlowFilter({ color: 0xffd60a, outerStrength: 4, distance: 18 })]
    sun.x = TRAIN_SCENE_W - 140
    sun.y = 96
    this.app.stage.addChild(sun)
    gsap.to(sun.scale, { x: 1.08, y: 1.08, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    this.tweened.push(sun.scale)

    const far = new Graphics().ellipse(300, TRAIN_SCENE_H - 110, 360, 130).fill({ color: SCENE.hillFar })
    const near = new Graphics().ellipse(660, TRAIN_SCENE_H - 80, 380, 120).fill({ color: SCENE.hillNear })
    this.hillLayer.addChild(far, near)

    const grass = new Graphics()
      .rect(0, TRAIN_SCENE_H - TRACK_INSET, TRAIN_SCENE_W, TRACK_INSET)
      .fill({ color: SCENE.grass })
    const trackY = TRAIN_SCENE_H - TRACK_INSET + 4
    grass.rect(0, trackY, TRAIN_SCENE_W, 6).fill({ color: SCENE.rail })
    for (let x = 12; x < TRAIN_SCENE_W; x += 44) {
      grass.rect(x, trackY - 8, 14, 20).fill({ color: SCENE.tie })
    }
    this.app.stage.addChild(grass)

    for (let i = 0; i < 3; i++) {
      const cloud = new Graphics()
      cloud.circle(0, 0, 26).circle(28, 6, 20).circle(-26, 8, 18).fill({ color: '#ffffff', alpha: 0.85 })
      cloud.x = 160 + i * 280
      cloud.y = 70 + (i % 2) * 36
      this.cloudLayer.addChild(cloud)
      gsap.to(cloud, { x: cloud.x + 60, duration: 6 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      this.tweened.push(cloud)
    }
  }

  setWord(card: WordCard): void {
    this.clearPicture()
    this.trainLayer.removeChildren()
    this.trainLayer.position.set(0, 0)
    this.emptyCar = null
    this.emptyCarBg = null

    const letters = card.word.split('')
    const count = letters.length
    const carW = TRAIN_CAR
    const gap = 14
    const locoW = Math.round(carW * 1.35)
    const totalW = locoW + gap + count * (carW + gap) - gap
    const startX = Math.round((TRAIN_SCENE_W - totalW) / 2)
    const carBottom = TRAIN_SCENE_H - TRACK_INSET - 2
    const carTop = carBottom - carW

    const loco = this.buildLocomotive(locoW, carW)
    loco.position.set(startX, carTop)
    this.trainLayer.addChild(loco)
    this.locoTop = { x: startX + locoW * 0.45, y: carTop }

    letters.forEach((char, index) => {
      const isEmpty = index === card.missingIndex
      const carX = startX + locoW + gap + (count - 1 - index) * (carW + gap)
      const { container, bg } = this.buildCar(carW, isEmpty ? null : char, index)
      container.position.set(carX, carTop)
      this.trainLayer.addChild(container)
      if (isEmpty) {
        this.emptyCar = container
        this.emptyCarBg = bg
      }
    })
  }

  private buildCar(carW: number, char: string | null, index: number): { container: Container; bg: Graphics } {
    const container = new Container()
    const color = char === null ? SCENE.carEmpty : index % 2 === 0 ? SCENE.trainCar : SCENE.trainCarAlt
    const bg = new Graphics().roundRect(0, 0, carW, carW, 18).fill({ color })
    if (char === null) {
      bg.roundRect(4, 4, carW - 8, carW - 8, 14).stroke({ width: 4, color: SCENE.trainRoof, alpha: 0.5 })
    }
    container.addChild(bg)
    container.addChild(this.wheel(carW * 0.28, carW))
    container.addChild(this.wheel(carW * 0.72, carW))
    if (char !== null) {
      container.addChild(this.letter(char, carW))
    }
    return { container, bg }
  }

  private buildLocomotive(locoW: number, carW: number): Container {
    const container = new Container()
    container.addChild(new Graphics().roundRect(0, carW * 0.2, locoW, carW * 0.8, 18).fill({ color: SCENE.trainBody }))
    container.addChild(new Graphics().roundRect(locoW * 0.05, 0, locoW * 0.5, carW * 0.5, 14).fill({ color: SCENE.trainRoof }))
    container.addChild(new Graphics().roundRect(locoW * 0.72, -carW * 0.12, 18, carW * 0.36, 6).fill({ color: SCENE.trainRoof }))
    container.addChild(this.wheel(locoW * 0.3, carW))
    container.addChild(this.wheel(locoW * 0.72, carW))
    return container
  }

  private wheel(x: number, carW: number): Graphics {
    return new Graphics().circle(x, carW + 10, WHEEL_RADIUS).fill({ color: SCENE.wheel })
  }

  private letter(char: string, carW: number): Text {
    const text = new Text({ text: char, style: { fontFamily: FONT, fontSize: 54, fontWeight: '700', fill: SCENE.letterInk } })
    text.anchor.set(0.5)
    text.position.set(carW / 2, carW / 2)
    return text
  }

  fillLetter(char: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emptyCar) {
        resolve()
        return
      }
      this.emptyCarBg?.clear().roundRect(0, 0, TRAIN_CAR, TRAIN_CAR, 18).fill({ color: SCENE.trainCar })
      const text = this.letter(char, TRAIN_CAR)
      text.scale.set(0)
      this.emptyCar.addChild(text)
      gsap.to(text.scale, { x: 1, y: 1, duration: 0.5, ease: 'back.out(2)', onComplete: () => resolve() })
    })
  }

  chug(): Promise<void> {
    return new Promise((resolve) => {
      const timeline = gsap.timeline({ onComplete: () => resolve() })
      timeline.to(this.trainLayer, { x: '-=90', duration: 1.2, ease: 'power1.inOut' })
      for (let i = 0; i < 5; i++) {
        timeline.call(() => this.puff(), [], i * 0.22)
      }
      gsap.to(this.trainLayer, { y: '+=6', duration: 0.15, yoyo: true, repeat: 7, ease: 'sine.inOut' })
      this.tweened.push(this.trainLayer)
    })
  }

  private puff(): void {
    const puff = new Graphics().circle(0, 0, 13).fill({ color: SCENE.steam, alpha: 0.9 })
    puff.position.set(this.locoTop.x + this.trainLayer.x, this.locoTop.y)
    this.steamLayer.addChild(puff)
    gsap.to(puff, { y: puff.y - 90, x: puff.x - 26, alpha: 0, duration: 1.1, ease: 'sine.out', onComplete: () => puff.destroy() })
    gsap.to(puff.scale, { x: 2.2, y: 2.2, duration: 1.1, ease: 'sine.out' })
  }

  showPicture(emoji: string): void {
    if (!this.app) return
    const text = new Text({ text: emoji, style: { fontFamily: FONT, fontSize: 120 } })
    text.anchor.set(0.5)
    text.position.set(TRAIN_SCENE_W / 2, 130)
    text.scale.set(0)
    this.app.stage.addChild(text)
    this.pictureText = text
    gsap.to(text.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' })
    gsap.to(text, { y: 110, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    this.tweened.push(text)
  }

  private clearPicture(): void {
    if (this.pictureText) {
      gsap.killTweensOf(this.pictureText)
      this.pictureText.destroy()
      this.pictureText = null
    }
  }

  destroy(): void {
    for (const target of this.tweened) {
      gsap.killTweensOf(target)
    }
    this.clearPicture()
    this.app?.destroy(true, { children: true, texture: true })
    this.app = null
  }
}
