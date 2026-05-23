// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter, GlowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { TRAIN_CAR, TRAIN_SCENE_H, TRAIN_SCENE_W } from '@/constants/gameConfig'
import type { WordCard } from '@/constants/words'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const SKY_BANDS = 12
const TRACK_INSET = 95
const WHEEL_RADIUS = 16

// Encapsulates the WebGL train scene: backdrop, the assembling train, steam,
// and the reward picture. The Vue component drives it; no Vue imports here.
//
// Every GSAP animation is tracked by reference and killed explicitly — relying
// on gsap.killTweensOf(pixiObject) proved unreliable, leaving infinite tweens
// writing to destroyed Pixi containers (the "Cannot set 'y' of null" crash).
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

  private readonly tweens = new Set<Anim>()
  private readonly pictureTweens = new Set<Anim>()
  private departTween: Anim | null = null
  private spent: Container[] = []

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private killSet(set: Set<Anim>): void {
    set.forEach((anim) => anim.kill())
    set.clear()
  }

  // Hide a finished display object and collect it; it is destroyed later by
  // setWord/destroy, never inside a GSAP callback (which would re-render a
  // destroyed Pixi object the next tick).
  private retire(obj: Container, anim: Anim): void {
    this.tweens.delete(anim)
    // Kill (not just untrack) so GSAP removes the finished animation from its
    // root and can never re-render it onto a later-destroyed Pixi object.
    anim.kill()
    obj.visible = false
    this.spent.push(obj)
  }

  private destroySpent(): void {
    for (const obj of this.spent) {
      obj.destroy()
    }
    this.spent = []
  }

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
    sun.position.set(TRAIN_SCENE_W - 140, 96)
    this.app.stage.addChild(sun)
    this.track(gsap.to(sun.scale, { x: 1.08, y: 1.08, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }))

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
      cloud.position.set(160 + i * 280, 70 + (i % 2) * 36)
      this.cloudLayer.addChild(cloud)
      this.track(gsap.to(cloud, { x: cloud.x + 60, duration: 6 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    }
  }

  setWord(card: WordCard): void {
    this.departTween?.kill()
    this.departTween = null
    this.destroySpent()
    this.clearPicture()
    this.trainLayer.removeChildren()
    this.trainLayer.position.set(0, 0)
    this.trainLayer.alpha = 1
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
    this.locoTop = { x: startX + locoW * 0.3, y: carTop }

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

    // Slide the new train in from the right (its reading-start side).
    this.track(
      gsap.fromTo(
        this.trainLayer,
        { x: TRAIN_SCENE_W * 0.55, alpha: 0 },
        { x: 0, alpha: 1, duration: 0.5, ease: 'power3.out' }
      )
    )
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

  // A classic steam engine facing left (the travel direction): cowcatcher and
  // flared funnel at the front-left, cab with a window at the back-right.
  private buildLocomotive(locoW: number, carW: number): Container {
    const c = new Container()
    const top = carW * 0.34
    const h = carW * 0.5
    const bot = top + h
    const left = 16
    const right = locoW * 0.66
    const w = right - left

    // Running board + angled cowcatcher at the front.
    c.addChild(new Graphics().roundRect(2, bot - 2, locoW - 4, 12, 4).fill({ color: SCENE.trainRoof }))
    c.addChild(new Graphics().poly([2, bot - 2, left + 8, bot - 2, left, bot + 14, -8, bot + 14]).fill({ color: SCENE.trainRoof }))

    // Boiler cylinder with a glossy top highlight.
    c.addChild(new Graphics().roundRect(left, top, w, h, h / 2).fill({ color: SCENE.trainBody }))
    c.addChild(new Graphics().roundRect(left + 10, top + 4, w - 20, h * 0.26, h * 0.13).fill({ color: SCENE.trainBodyLight }))
    // Smokebox front cap + headlight + boiler bands.
    c.addChild(new Graphics().roundRect(left - 3, top, 18, h, 8).fill({ color: SCENE.trainRoof }))
    c.addChild(new Graphics().circle(left + 6, top + h * 0.5, 6).fill({ color: SCENE.headlight }))
    c.addChild(new Graphics().rect(left + w * 0.42, top, 4, h).fill({ color: SCENE.trainRoof, alpha: 0.5 }))
    c.addChild(new Graphics().rect(left + w * 0.6, top, 4, h).fill({ color: SCENE.trainRoof, alpha: 0.5 }))

    // Steam dome and flared funnel.
    c.addChild(new Graphics().roundRect(left + w * 0.46, top - 10, 22, 16, 8).fill({ color: SCENE.trainRoof }))
    const fx = left + 26
    c.addChild(new Graphics().poly([fx - 7, top, fx + 7, top, fx + 13, top - 26, fx - 13, top - 26]).fill({ color: SCENE.trainRoof }))
    c.addChild(new Graphics().roundRect(fx - 14, top - 31, 28, 8, 4).fill({ color: SCENE.trainBody }))

    // Cab with roof overhang and a window.
    const cabL = locoW * 0.62
    const cabW = locoW * 0.36
    const cabTop = top - carW * 0.3
    c.addChild(new Graphics().roundRect(cabL, cabTop, cabW, bot - cabTop, 10).fill({ color: SCENE.trainBody }))
    c.addChild(new Graphics().roundRect(cabL - 6, cabTop - 8, cabW + 12, 12, 6).fill({ color: SCENE.trainRoof }))
    c.addChild(new Graphics().roundRect(cabL + cabW * 0.18, cabTop + 10, cabW * 0.64, (bot - cabTop) * 0.42, 8).fill({ color: SCENE.trainWindow }))

    // Driving wheels joined by a connecting rod, plus a small leading wheel.
    const driveX = locoW * 0.44
    const rearX = locoW * 0.72
    const driveR = 20
    c.addChild(this.locoWheel(locoW * 0.18, carW, 14))
    c.addChild(this.locoWheel(driveX, carW, driveR))
    c.addChild(this.locoWheel(rearX, carW, driveR))
    const rodY = carW + 26 - driveR
    c.addChild(new Graphics().roundRect(driveX - 2, rodY - 3, rearX - driveX + 4, 6, 3).fill({ color: SCENE.wheelRim }))
    return c
  }

  private wheel(x: number, carW: number): Graphics {
    return new Graphics().circle(x, carW + 10, WHEEL_RADIUS).fill({ color: SCENE.wheel })
  }

  // Detailed wheel (tyre, rim, hub) whose bottom aligns with the cars' wheels.
  private locoWheel(x: number, carW: number, r: number): Graphics {
    const cy = carW + 26 - r
    const g = new Graphics()
    g.circle(x, cy, r).fill({ color: SCENE.wheel })
    g.circle(x, cy, r * 0.62).fill({ color: SCENE.wheelRim })
    g.circle(x, cy, r * 0.22).fill({ color: SCENE.wheel })
    return g
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
      this.track(gsap.to(text.scale, { x: 1, y: 1, duration: 0.45, ease: 'back.out(2.2)', onComplete: () => resolve() }))
    })
  }

  // Smoothly accelerate the assembled train off the left edge, puffing steam,
  // and float the word's picture up. Fire-and-forget; setWord cleans it up.
  celebrate(picture: string): void {
    this.departTween = gsap.to(this.trainLayer, { x: -TRAIN_SCENE_W, duration: 1.4, ease: 'power2.in' })
    this.track(this.departTween)
    for (let i = 0; i < 6; i++) {
      this.track(gsap.delayedCall(i * 0.18, () => this.puff()))
    }
    this.showPicture(picture)
  }

  private puff(): void {
    if (!this.app) return
    const puff = new Graphics().circle(0, 0, 13).fill({ color: SCENE.steam, alpha: 0.9 })
    puff.position.set(this.locoTop.x + this.trainLayer.x, this.locoTop.y)
    this.steamLayer.addChild(puff)
    const tl: Anim = gsap.timeline({ onComplete: () => this.retire(puff, tl) })
    tl.to(puff, { y: puff.y - 90, x: puff.x - 26, alpha: 0, duration: 1.1, ease: 'sine.out' }, 0)
    tl.to(puff.scale, { x: 2.2, y: 2.2, duration: 1.1, ease: 'sine.out' }, 0)
    this.track(tl)
  }

  private showPicture(emoji: string): void {
    if (!this.app) return
    const text = new Text({ text: emoji, style: { fontFamily: FONT, fontSize: 120 } })
    text.anchor.set(0.5)
    text.position.set(TRAIN_SCENE_W / 2, 150)
    text.scale.set(0)
    this.app.stage.addChild(text)
    this.pictureText = text
    const pop = gsap.to(text.scale, { x: 1, y: 1, duration: 0.6, ease: 'back.out(2)' })
    const bob = gsap.to(text, { y: 128, duration: 1.2, yoyo: true, repeat: 6, ease: 'sine.inOut' })
    this.pictureTweens.add(pop)
    this.pictureTweens.add(bob)
    this.track(pop)
    this.track(bob)
  }

  private clearPicture(): void {
    this.killSet(this.pictureTweens)
    if (this.pictureText) {
      this.pictureText.destroy()
      this.pictureText = null
    }
  }

  destroy(): void {
    this.killSet(this.tweens)
    this.killSet(this.pictureTweens)
    this.departTween = null
    this.spent = []
    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true })
      } catch {
        // Renderer already torn down; nothing to clean up.
      }
    }
    this.app = null
    this.pictureText = null
    this.emptyCar = null
    this.emptyCarBg = null
  }
}
