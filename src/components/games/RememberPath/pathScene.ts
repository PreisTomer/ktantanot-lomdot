// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { DIR_DELTA } from '@/utils/pathWalk'
import { PATH_COLS, PATH_ROWS, PATH_STEP_MS } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline
type DirHandler = (dir: number) => void

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const SKY_TOP = '#eaf7ff'
const SKY_BOTTOM = '#eafbe8'
const CELL = 80
const HOP = 34
const ARROW_TRIANGLES: number[][] = [
  [0, -16, 15, 11, -15, 11], // up
  [0, 16, 15, -11, -15, -11], // down
  [-16, 0, 11, -15, 11, 15], // left
  [16, 0, -11, -15, -11, 15] // right
]

// זכור את המסלול scene: a stepping-stone grid, a rabbit that hops a path, and a
// direction D-pad to retrace it. markRaw in the component; tracked tweens.
export class PathScene {
  private app: Application | null = null
  private rabbit: Text | null = null
  private readonly cells: { x: number; y: number }[][] = []
  private readonly arrows: Container[] = []
  private startCol = Math.floor(PATH_COLS / 2)
  private startRow = Math.floor(PATH_ROWS / 2)
  private col = this.startCol
  private row = this.startRow
  private onDir: DirHandler | null = null
  private interactive = false
  private w = 0
  private h = 0

  private readonly tweens = new Set<Anim>()
  private pathTimeline: Anim | null = null

  private track(anim: Anim): Anim {
    this.tweens.add(anim)
    return anim
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
    this.buildGrid()
    this.buildRabbit()
    this.buildPad()
  }

  // Re-lay-out for a new canvas size (device rotation). The component re-shows
  // the current path afterwards. Returns nothing; the cell grid is rebuilt.
  resize(width: number, height: number): void {
    if (!this.app) return
    this.w = width
    this.h = height
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.pathTimeline = null
    this.cells.length = 0
    this.arrows.length = 0
    this.rabbit = null
    this.app.stage.removeChildren().forEach((child) => child.destroy({ children: true }))
    this.app.renderer.resize(width, height)
    this.buildBackdrop()
    this.buildGrid()
    this.buildRabbit()
    this.buildPad()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = this.h / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, this.w, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)
  }

  private buildGrid(): void {
    if (!this.app) return
    const gridW = PATH_COLS * CELL
    const gridH = PATH_ROWS * CELL
    const x0 = (this.w - gridW) / 2
    const portrait = this.h > this.w
    const y0 = portrait ? this.h * 0.46 - gridH / 2 : 44
    const boardPad = 26
    const grassLight = lerpColor(SCENE.leaf, '#ffffff', 0.62)
    const stoneTop = lerpColor(SCENE.leaf, '#ffffff', 0.12)
    const stoneHi = lerpColor(SCENE.leaf, '#ffffff', 0.55)

    // Garden bed framing the grid.
    const board = new Graphics()
      .roundRect(x0 - boardPad, y0 - boardPad, gridW + boardPad * 2, gridH + boardPad * 2, 34)
      .fill({ color: grassLight })
    board.roundRect(x0 - boardPad, y0 - boardPad, gridW + boardPad * 2, gridH + boardPad * 2, 34).stroke({ width: 5, color: SCENE.leaf, alpha: 0.45 })
    board.filters = [new DropShadowFilter({ alpha: 0.22, blur: 5 })]
    this.app.stage.addChild(board)

    // Dimensional stepping stones (shadow, raised rim, glossy top, highlight).
    const stones = new Graphics()
    for (let r = 0; r < PATH_ROWS; r++) {
      const rowCells: { x: number; y: number }[] = []
      for (let c = 0; c < PATH_COLS; c++) {
        const x = x0 + c * CELL + CELL / 2
        const y = y0 + r * CELL + CELL / 2
        stones.ellipse(x, y + 11, 29, 9).fill({ color: SCENE.wheel, alpha: 0.12 })
        stones.circle(x, y + 4, 31).fill({ color: SCENE.leafDeep })
        stones.circle(x, y, 31).fill({ color: stoneTop })
        stones.ellipse(x - 9, y - 10, 13, 7).fill({ color: stoneHi, alpha: 0.75 })
        rowCells.push({ x, y })
      }
      this.cells.push(rowCells)
    }
    this.app.stage.addChild(stones)
  }

  private buildRabbit(): void {
    if (!this.app) return
    const rabbit = new Text({ text: '🐰', style: { fontFamily: FONT, fontSize: 52 } })
    rabbit.anchor.set(0.5)
    const start = this.cells[this.startRow][this.startCol]
    rabbit.position.set(start.x, start.y)
    rabbit.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(rabbit)
    this.rabbit = rabbit
  }

  private buildPad(): void {
    if (!this.app) return
    const cx = this.w / 2
    const cy = this.h > this.w ? this.h - 130 : this.h - 96
    const offsets: [number, number][] = [
      [0, -64],
      [0, 64],
      [-72, 0],
      [72, 0]
    ]
    for (let dir = 0; dir < 4; dir++) {
      const pad = new Container()
      const bg = new Graphics().roundRect(-34, -34, 68, 68, 18).fill({ color: SCENE.trainCar })
      bg.poly(ARROW_TRIANGLES[dir]).fill({ color: SCENE.white })
      pad.addChild(bg)
      pad.filters = [new DropShadowFilter({ alpha: 0.28, blur: 3 })]
      pad.position.set(cx + offsets[dir][0], cy + offsets[dir][1])
      pad.eventMode = 'none'
      pad.cursor = 'pointer'
      pad.alpha = 0.55
      const d = dir
      pad.on('pointertap', () => {
        if (this.interactive) this.onDir?.(d)
      })
      this.app.stage.addChild(pad)
      this.arrows.push(pad)
    }
  }

  setHandler(onDir: DirHandler): void {
    this.onDir = onDir
  }

  setInteractive(on: boolean): void {
    this.interactive = on
    this.arrows.forEach((pad) => {
      pad.eventMode = on ? 'static' : 'none'
      pad.alpha = on ? 1 : 0.55
    })
  }

  flashArrow(dir: number): void {
    const pad = this.arrows[dir]
    if (!pad) return
    this.track(gsap.fromTo(pad.scale, { x: 1, y: 1 }, { x: 1.22, y: 1.22, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  // Watch phase: hop the rabbit along the path, flashing each arrow; then send
  // the rabbit back to the start and call onDone.
  showPath(dirs: number[], onDone: () => void): void {
    this.pathTimeline?.kill()
    this.setInteractive(false)
    this.toStart()
    const timeline = gsap.timeline({ onComplete: onDone })
    let col = this.startCol
    let row = this.startRow
    timeline.to({}, { duration: 0.4 })
    for (const dir of dirs) {
      col += DIR_DELTA[dir][0]
      row += DIR_DELTA[dir][1]
      const cell = this.cells[row][col]
      timeline.call(() => this.flashArrow(dir))
      this.addHop(timeline, cell.x, cell.y, PATH_STEP_MS / 1000)
    }
    timeline.to({}, { duration: 0.35 })
    timeline.call(() => this.toStart())
    this.pathTimeline = timeline
    this.track(timeline)
  }

  private addHop(timeline: gsap.core.Timeline, x: number, y: number, duration: number): void {
    if (!this.rabbit) return
    const rabbit = this.rabbit
    timeline.to(rabbit, { x, duration, ease: 'power1.inOut' })
    timeline.to(rabbit, { y: y - HOP, duration: duration / 2, ease: 'sine.out' }, `<`)
    timeline.to(rabbit, { y, duration: duration / 2, ease: 'sine.in' }, `>`)
  }

  // Repeat phase: hop one cell in the given direction (only called for a
  // correct, in-bounds step).
  hopRabbit(dir: number): void {
    this.col += DIR_DELTA[dir][0]
    this.row += DIR_DELTA[dir][1]
    const cell = this.cells[this.row]?.[this.col]
    if (!cell || !this.rabbit) return
    const timeline = gsap.timeline()
    this.addHop(timeline, cell.x, cell.y, 0.34)
    this.track(timeline)
  }

  private toStart(): void {
    this.col = this.startCol
    this.row = this.startRow
    const start = this.cells[this.startRow][this.startCol]
    if (this.rabbit) this.rabbit.position.set(start.x, start.y)
  }

  resetRabbit(): void {
    const start = this.cells[this.startRow][this.startCol]
    if (this.rabbit) this.track(gsap.to(this.rabbit, { x: start.x, y: start.y, duration: 0.3, ease: 'power2.inOut' }))
    this.col = this.startCol
    this.row = this.startRow
  }

  celebrate(): void {
    if (!this.rabbit) return
    this.track(gsap.to(this.rabbit.scale, { x: 1.25, y: 1.25, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.pathTimeline = null
    this.rabbit = null
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
