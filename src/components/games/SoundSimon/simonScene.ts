// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { BlurFilter } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { COLOR, SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { prefersReducedMotion } from '@/utils/motion'
import { SIMON_SCENE_H, SIMON_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline
type PadHandler = (pad: number) => void

interface Pad {
  container: Container
  glow: Graphics
  lit: Graphics
  color: string
}

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 14
const PAD = 212
const GAP = 36
const RADIUS = 28
const PAD_COLORS = [COLOR.coral, COLOR.sky, COLOR.leaf, COLOR.sun]
const TONES = [392, 523.25, 659.25, 783.99]
const NOTE_GLYPHS = ['🎵', '🎶', '🎼', '🎹']

// סיימון של צלילים scene: four glossy pads on a softly lit stage. Each pad lights
// with a glow and plays its own tone when it is part of the sequence or tapped.
// Same crash-safe rules as the other scenes (markRaw in the component, tracked
// tweens; ambient notes are reused, never created-then-destroyed in a callback).
export class SimonScene {
  private app: Application | null = null
  private pads: Pad[] = []
  private notes: Text[] = []
  private onPad: PadHandler | null = null
  private ctx: AudioContext | null = null
  private interactive = false
  private readonly tweens = new Set<Anim>()

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    const app = new Application()
    await app.init({
      canvas,
      width: SIMON_SCENE_W,
      height: SIMON_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.buildPads()
    this.buildNotes()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const stage = new Graphics()
    const bandHeight = SIMON_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SCENE.stageTop, SCENE.stageBottom, i / (BANDS - 1))
      stage.rect(0, i * bandHeight, SIMON_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(stage)

    // Soft spotlight pooling behind the pad cluster.
    const spot = new Graphics().ellipse(SIMON_SCENE_W / 2, SIMON_SCENE_H / 2, 420, 320).fill({ color: SCENE.stageGlow })
    spot.alpha = 0.22
    spot.filters = [new BlurFilter({ strength: 18 })]
    this.app.stage.addChild(spot)
  }

  private buildNotes(): void {
    if (!this.app || prefersReducedMotion()) return
    for (let i = 0; i < 6; i++) {
      const note = new Text({
        text: NOTE_GLYPHS[i % NOTE_GLYPHS.length],
        style: { fontFamily: FONT, fontSize: 30 + (i % 3) * 8, fill: SCENE.stageGlow }
      })
      note.anchor.set(0.5)
      note.alpha = 0.4
      this.resetNote(note, true)
      this.app.stage.addChild(note)
      this.notes.push(note)
      this.driftNote(note, i)
    }
  }

  private resetNote(note: Text, initial: boolean): void {
    note.x = 60 + Math.random() * (SIMON_SCENE_W - 120)
    note.y = initial ? Math.random() * SIMON_SCENE_H : SIMON_SCENE_H + 30
  }

  private driftNote(note: Text, index: number): void {
    const duration = 7 + Math.random() * 5
    this.track(
      gsap.to(note, {
        y: -40,
        x: note.x + (Math.random() - 0.5) * 120,
        duration,
        delay: index * 0.8,
        ease: 'none',
        repeat: -1,
        onRepeat: () => this.resetNote(note, false)
      })
    )
  }

  private gridCenter(pad: number): { x: number; y: number } {
    const col = pad % 2
    const row = Math.floor(pad / 2)
    const cx = SIMON_SCENE_W / 2 + (col === 0 ? -1 : 1) * (PAD + GAP) / 2
    const cy = SIMON_SCENE_H / 2 + (row === 0 ? -1 : 1) * (PAD + GAP) / 2
    return { x: cx, y: cy }
  }

  private buildPads(): void {
    if (!this.app) return
    for (let i = 0; i < PAD_COLORS.length; i++) {
      const color = PAD_COLORS[i]
      const { x, y } = this.gridCenter(i)
      const container = new Container()
      container.position.set(x, y)

      const glow = new Graphics()
        .roundRect(-PAD / 2 - 14, -PAD / 2 - 14, PAD + 28, PAD + 28, RADIUS + 10)
        .fill({ color: lerpColor(color, COLOR.white, 0.4) })
      glow.alpha = 0
      glow.filters = [new BlurFilter({ strength: 14 })]

      const base = new Graphics()
        .roundRect(-PAD / 2, -PAD / 2, PAD, PAD, RADIUS)
        .fill({ color: lerpColor(color, COLOR.ink, 0.34) })
      const face = new Graphics()
        .roundRect(-PAD / 2 + 8, -PAD / 2 + 8, PAD - 16, PAD * 0.52, RADIUS - 6)
        .fill({ color: lerpColor(color, COLOR.white, 0.12) })
      face.alpha = 0.6
      const gloss = new Graphics()
        .roundRect(-PAD / 2 + 16, -PAD / 2 + 14, PAD - 32, PAD * 0.22, 16)
        .fill({ color: COLOR.white })
      gloss.alpha = 0.22

      const lit = new Graphics().roundRect(-PAD / 2, -PAD / 2, PAD, PAD, RADIUS).fill({ color })
      lit.alpha = 0

      const note = new Text({ text: '🎵', style: { fontFamily: FONT, fontSize: 58 } })
      note.anchor.set(0.5)
      note.alpha = 0.85

      container.addChild(glow, base, face, gloss, lit, note)
      container.filters = [new DropShadowFilter({ alpha: 0.4, blur: 5, offset: { x: 0, y: 6 } })]
      container.eventMode = 'static'
      container.cursor = 'pointer'
      const index = i
      container.on('pointertap', () => {
        if (this.interactive) this.onPad?.(index)
      })

      this.app.stage.addChild(container)
      this.pads.push({ container, glow, lit, color })
    }
  }

  setHandler(onPad: PadHandler): void {
    this.onPad = onPad
  }

  setInteractive(enabled: boolean): void {
    this.interactive = enabled
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private playTone(freq: number): void {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.52)
  }

  // Light a pad with its glow and tone. Used both to play the sequence and to
  // echo the child's taps.
  activate(pad: number): void {
    const entry = this.pads[pad]
    if (!entry) return
    this.playTone(TONES[pad])
    const timeline = gsap.timeline()
    timeline.to(entry.lit, { alpha: 1, duration: 0.08, ease: 'power2.out' }, 0)
    timeline.to(entry.glow, { alpha: 0.75, duration: 0.1, ease: 'power2.out' }, 0)
    timeline.to(entry.container.scale, { x: 1.07, y: 1.07, duration: 0.1, ease: 'power2.out' }, 0)
    timeline.to(entry.lit, { alpha: 0, duration: 0.32, ease: 'power2.in' }, 0.14)
    timeline.to(entry.glow, { alpha: 0, duration: 0.34, ease: 'power2.in' }, 0.14)
    timeline.to(entry.container.scale, { x: 1, y: 1, duration: 0.26, ease: 'power2.inOut' }, 0.14)
    this.track(timeline)
  }

  celebrate(): void {
    this.pads.forEach((pad, i) => {
      this.track(
        gsap.to(pad.container.scale, {
          x: 1.1,
          y: 1.1,
          duration: 0.2,
          delay: i * 0.07,
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
    this.pads = []
    this.notes = []
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined)
      this.ctx = null
    }
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
