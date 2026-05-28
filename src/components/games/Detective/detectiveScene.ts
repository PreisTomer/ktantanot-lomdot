// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter, GlowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { CONFETTI_COLORS, SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { prefersReducedMotion } from '@/utils/motion'
import { DETECTIVE_SCENE_H, DETECTIVE_SCENE_W } from '@/constants/gameConfig'
import type { PictureWord } from '@/constants/words'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const DESK_TOP = '#fff3da'
const DESK_BOTTOM = '#ffe2c2'
const BANDS = 12
const CARD_W = 174
const CARD_H = 200
const CARD_GAP = 22
const LENS_R = 62

interface Card {
  container: Container
  word: string
  overlay: Graphics
}

type PickHandler = (word: string) => void

// Detective scene: a magnifying glass framing the target letter, with tappable
// picture+word cards below. See the markRaw / tween-kill notes in trainScene.ts;
// the same rules apply here.
export class DetectiveScene {
  private app: Application | null = null
  private readonly cardsLayer = new Container()
  private readonly particleLayer = new Container()
  private cards: Card[] = []
  private glassLetter: Text | null = null
  private detective: Text | null = null
  private glass: Container | null = null
  private onPick: PickHandler | null = null

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
      width: DETECTIVE_SCENE_W,
      height: DETECTIVE_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    app.stage.addChild(this.cardsLayer, this.particleLayer)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const desk = new Graphics()
    const bandHeight = DETECTIVE_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(DESK_TOP, DESK_BOTTOM, i / (BANDS - 1))
      desk.rect(0, i * bandHeight, DETECTIVE_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(desk)

    const cx = DETECTIVE_SCENE_W / 2
    const cy = 116

    // Detective beside the magnifier.
    const detective = new Text({ text: '🕵️', style: { fontFamily: FONT, fontSize: 96 } })
    detective.anchor.set(0.5)
    detective.position.set(cx - 168, cy + 6)
    this.app.stage.addChild(detective)
    this.detective = detective

    // Magnifying glass: handle, lens fill, glossy ring, and the target letter.
    const glass = new Container()
    const handle = new Graphics()
      .roundRect(LENS_R * 0.62, LENS_R * 0.62, 20, 78, 10)
      .fill({ color: SCENE.trainRoof })
    handle.rotation = 0
    glass.addChild(handle)
    glass.addChild(new Graphics().circle(0, 0, LENS_R + 12).fill({ color: SCENE.trainRoof }))
    glass.addChild(new Graphics().circle(0, 0, LENS_R).fill({ color: SCENE.trainWindow }))
    const letter = new Text({ text: '', style: { fontFamily: FONT, fontSize: 72, fontWeight: '700', fill: SCENE.letterInk } })
    letter.anchor.set(0.5)
    glass.addChild(letter)
    glass.filters = [new GlowFilter({ color: 0xffffff, outerStrength: 2, distance: 8 })]
    glass.position.set(cx, cy)
    this.glassLetter = letter
    this.glass = glass
    this.app.stage.addChild(glass)
    if (!prefersReducedMotion()) {
      this.track(gsap.to(glass.scale, { x: 1.05, y: 1.05, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }))
    }
  }

  // One-shot opening animation: detective pops up first, then the magnifying
  // glass scales in beside her with a little wiggle of curiosity.
  intro(): Promise<void> {
    const detective = this.detective
    const glass = this.glass
    if (!detective || !glass) return Promise.resolve()
    detective.alpha = 0
    detective.scale.set(0)
    glass.alpha = 0
    glass.scale.set(0)
    return new Promise<void>((resolve) => {
      let done = false
      const finish = (): void => {
        if (done) return
        done = true
        resolve()
      }
      const tl = gsap.timeline({ onComplete: finish })
      tl.to(detective, { alpha: 1, duration: 0.2 })
      tl.to(detective.scale, { x: 1, y: 1, duration: 0.45, ease: 'back.out(2)' }, '<')
      tl.to(glass, { alpha: 1, duration: 0.2 }, '+=0.05')
      tl.to(glass.scale, { x: 1, y: 1, duration: 0.45, ease: 'back.out(2)' }, '<')
      tl.to(glass, { rotation: -0.18, duration: 0.18, ease: 'sine.out' })
      tl.to(glass, { rotation: 0.12, duration: 0.18, ease: 'sine.inOut' })
      tl.to(glass, { rotation: 0, duration: 0.14, ease: 'sine.in' })
      this.track(tl)
      setTimeout(finish, 1700)
    })
  }

  setRound(target: string, options: PictureWord[], onPick: PickHandler): void {
    this.onPick = onPick
    this.destroySpent()
    for (const card of this.cards) card.container.destroy()
    this.cards = []
    if (this.glassLetter) this.glassLetter.text = target

    const totalW = options.length * CARD_W + (options.length - 1) * CARD_GAP
    const startX = (DETECTIVE_SCENE_W - totalW) / 2
    const cardY = 286

    options.forEach((option, index) => {
      const card = this.buildCard(option)
      card.container.position.set(startX + index * (CARD_W + CARD_GAP), cardY)
      this.cardsLayer.addChild(card.container)
      this.cards.push(card)
      this.track(
        gsap.from(card.container, { y: cardY + 50, alpha: 0, duration: 0.4, delay: index * 0.06, ease: 'power3.out' })
      )
    })
  }

  private buildCard(option: PictureWord): Card {
    const container = new Container()
    const bg = new Graphics().roundRect(0, 0, CARD_W, CARD_H, 22).fill({ color: SCENE.steam })
    bg.filters = [new DropShadowFilter({ alpha: 0.25, blur: 3 })]
    const picture = new Text({ text: option.picture, style: { fontFamily: FONT, fontSize: 86 } })
    picture.anchor.set(0.5)
    picture.position.set(CARD_W / 2, CARD_H * 0.42)
    const word = new Text({ text: option.word, style: { fontFamily: FONT, fontSize: 30, fontWeight: '700', fill: SCENE.letterInk } })
    word.anchor.set(0.5)
    word.position.set(CARD_W / 2, CARD_H * 0.8)
    const overlay = new Graphics().roundRect(0, 0, CARD_W, CARD_H, 22).fill({ color: SCENE.trainRoof })
    overlay.alpha = 0
    container.addChild(bg, picture, word, overlay)
    container.eventMode = 'static'
    container.cursor = 'pointer'
    container.on('pointertap', () => this.onPick?.(option.word))
    return { container, word: option.word, overlay }
  }

  private getCard(word: string): Card | undefined {
    return this.cards.find((card) => card.word === word)
  }

  correct(word: string): Promise<void> {
    return new Promise((resolve) => {
      const card = this.getCard(word)
      if (!card) {
        resolve()
        return
      }
      for (const other of this.cards) other.container.eventMode = 'none'
      this.sparkle(card.container.x + CARD_W / 2, card.container.y + CARD_H / 2)
      this.track(
        gsap.to(card.container.scale, {
          x: 1.16,
          y: 1.16,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
          onComplete: () => resolve()
        })
      )
    })
  }

  wrong(word: string): void {
    const card = this.getCard(word)
    if (!card) return
    this.track(gsap.to(card.overlay, { alpha: 0.5, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }))
    this.track(gsap.to(card.container.scale, { x: 0.92, y: 0.92, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }))
  }

  private sparkle(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      const bit = new Graphics().circle(0, 0, 6).fill({ color })
      bit.position.set(x, y)
      this.particleLayer.addChild(bit)
      const angle = (i / 12) * Math.PI * 2
      const tween: Anim = gsap.to(bit, {
        x: x + Math.cos(angle) * 130,
        y: y + Math.sin(angle) * 130,
        alpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => this.retire(bit, tween)
      })
      this.track(tween)
    }
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.cards = []
    this.spent = []
    this.glassLetter = null
    this.detective = null
    this.glass = null
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
