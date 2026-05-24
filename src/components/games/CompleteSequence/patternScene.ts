// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { COMPLETE_SCENE_H, COMPLETE_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline

const FONT = 'Varela Round, Rubik, sans-serif'
const SKY_TOP = '#eaf3ff'
const SKY_BOTTOM = '#fdeffb'
const BANDS = 12
const CARD = 112
const GAP = 16
const ROW_Y = COMPLETE_SCENE_H * 0.52

// השלם את הרצף scene: a shelf row of pattern cards whose last cell is an empty
// "?" slot. Same crash-safe rules as the other scenes (markRaw in the
// component, tracked tweens; card tweens kill themselves on completion).
export class PatternScene {
  private app: Application | null = null
  private readonly row = new Container()
  private cards: Container[] = []
  private slot: Container | null = null

  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  private endTween(anim: Anim): void {
    this.tweens.delete(anim)
    anim.kill()
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: COMPLETE_SCENE_W,
      height: COMPLETE_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    app.stage.addChild(this.row)
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = COMPLETE_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, COMPLETE_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)
    // A shelf under the cards.
    this.app.stage.addChild(
      new Graphics().roundRect(40, ROW_Y + CARD / 2 + 6, COMPLETE_SCENE_W - 80, 16, 8).fill({ color: SCENE.rail })
    )
  }

  setRound(sequence: string[], missingIndex: number): void {
    for (const card of this.cards) card.destroy()
    this.cards = []
    this.slot = null

    const totalW = sequence.length * CARD + (sequence.length - 1) * GAP
    const startX = (COMPLETE_SCENE_W - totalW) / 2

    sequence.forEach((symbol, index) => {
      const isSlot = index === missingIndex
      const card = this.buildCard(isSlot ? null : symbol)
      card.position.set(startX + index * (CARD + GAP) + CARD / 2, ROW_Y)
      this.row.addChild(card)
      this.cards.push(card)
      if (isSlot) this.slot = card
      card.scale.set(0)
      const tween: Anim = gsap.to(card.scale, {
        x: 1,
        y: 1,
        duration: 0.32,
        delay: index * 0.07,
        ease: 'back.out(1.8)',
        onComplete: () => this.endTween(tween)
      })
      this.track(tween)
    })
  }

  private buildCard(symbol: string | null): Container {
    const card = new Container()
    const bg = new Graphics().roundRect(-CARD / 2, -CARD / 2, CARD, CARD, 22)
    if (symbol === null) {
      bg.fill({ color: SCENE.carEmpty })
      bg.roundRect(-CARD / 2 + 5, -CARD / 2 + 5, CARD - 10, CARD - 10, 18).stroke({ width: 4, color: SCENE.trainRoof, alpha: 0.45 })
      const q = new Text({ text: '?', style: { fontFamily: FONT, fontSize: 64, fontWeight: '700', fill: SCENE.letterInk } })
      q.anchor.set(0.5)
      card.addChild(bg, q)
    } else {
      bg.fill({ color: SCENE.white })
      const glyph = new Text({ text: symbol, style: { fontFamily: FONT, fontSize: 64 } })
      glyph.anchor.set(0.5)
      card.addChild(bg, glyph)
    }
    card.filters = [new DropShadowFilter({ alpha: 0.22, blur: 3 })]
    return card
  }

  // Fill the gap with the correct symbol — confirms a correct answer.
  reveal(symbol: string): void {
    if (!this.slot) return
    const glyph = new Text({ text: symbol, style: { fontFamily: FONT, fontSize: 64 } })
    glyph.anchor.set(0.5)
    glyph.scale.set(0)
    this.slot.addChild(glyph)
    const tween: Anim = gsap.to(glyph.scale, {
      x: 1,
      y: 1,
      duration: 0.4,
      ease: 'back.out(2.4)',
      onComplete: () => this.endTween(tween)
    })
    this.track(tween)
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.cards = []
    this.slot = null
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
