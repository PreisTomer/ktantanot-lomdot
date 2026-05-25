// Copyright © 2026 Tomer Preis. Licensed under the MIT License.

import { Application, Container, Graphics, Text } from 'pixi.js'
import { DropShadowFilter } from 'pixi-filters'
import gsap from 'gsap'

import { SCENE } from '@/theme/colors'
import { lerpColor } from '@/utils/color'
import { DIR_DELTA, walkPositions } from '@/utils/pathWalk'
import { PATH_COLS, PATH_ROWS, PATH_SCENE_H, PATH_SCENE_W } from '@/constants/gameConfig'

type Anim = gsap.core.Tween | gsap.core.Timeline
type DirHandler = (dir: number) => void

const FONT = 'Varela Round, Rubik, sans-serif'
const BANDS = 12
const SKY_TOP = '#eaf7ff'
const SKY_BOTTOM = '#fdeffb'
const CELL = 80
const HOP = 34
const ARROW_TRIANGLES: number[][] = [
  [0, -16, 15, 11, -15, 11],
  [0, 16, 15, -11, -15, -11],
  [-16, 0, 11, -15, 11, 15],
  [16, 0, -11, -15, -11, 15]
]

// משימת האחיות scene: a garden grid with the two sisters and a house at the end
// of the path. One player reads the directions, the other taps the D-pad to
// walk there. markRaw in the component; tracked tweens.
export class SistersScene {
  private app: Application | null = null
  private sisters: Text | null = null
  private house: Text | null = null
  private readonly cells: { x: number; y: number }[][] = []
  private readonly arrows: Container[] = []
  private startCol = Math.floor(PATH_COLS / 2)
  private startRow = Math.floor(PATH_ROWS / 2)
  private col = this.startCol
  private row = this.startRow
  private onDir: DirHandler | null = null
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
      width: PATH_SCENE_W,
      height: PATH_SCENE_H,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      backgroundAlpha: 0
    })
    this.app = app
    this.buildBackdrop()
    this.buildGrid()
    this.buildActors()
    this.buildPad()
  }

  private buildBackdrop(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = PATH_SCENE_H / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, PATH_SCENE_W, bandHeight + 1).fill({ color })
    }
    this.app.stage.addChild(sky)
  }

  private buildGrid(): void {
    if (!this.app) return
    const gridW = PATH_COLS * CELL
    const gridH = PATH_ROWS * CELL
    const x0 = (PATH_SCENE_W - gridW) / 2
    const y0 = 44
    const pad = 26
    const grassLight = lerpColor(SCENE.leaf, '#ffffff', 0.62)
    const stoneTop = lerpColor(SCENE.leaf, '#ffffff', 0.12)
    const stoneHi = lerpColor(SCENE.leaf, '#ffffff', 0.55)

    const board = new Graphics()
      .roundRect(x0 - pad, y0 - pad, gridW + pad * 2, gridH + pad * 2, 34)
      .fill({ color: grassLight })
    board.roundRect(x0 - pad, y0 - pad, gridW + pad * 2, gridH + pad * 2, 34).stroke({ width: 5, color: SCENE.leaf, alpha: 0.45 })
    board.filters = [new DropShadowFilter({ alpha: 0.22, blur: 5 })]
    this.app.stage.addChild(board)

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

  private buildActors(): void {
    if (!this.app) return
    const house = new Text({ text: '🏡', style: { fontFamily: FONT, fontSize: 48 } })
    house.anchor.set(0.5)
    house.visible = false
    house.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(house)
    this.house = house

    const sisters = new Text({ text: '👭', style: { fontFamily: FONT, fontSize: 50 } })
    sisters.anchor.set(0.5)
    const start = this.cells[this.startRow][this.startCol]
    sisters.position.set(start.x, start.y)
    sisters.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(sisters)
    this.sisters = sisters
  }

  private buildPad(): void {
    if (!this.app) return
    const cx = PATH_SCENE_W / 2
    const cy = PATH_SCENE_H - 96
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

  setRound(dirs: number[]): void {
    this.col = this.startCol
    this.row = this.startRow
    const start = this.cells[this.startRow][this.startCol]
    this.sisters?.position.set(start.x, start.y)

    const positions = walkPositions(this.startCol, this.startRow, dirs)
    const [endCol, endRow] = positions[positions.length - 1]
    const endCell = this.cells[endRow][endCol]
    if (this.house) {
      this.house.position.set(endCell.x, endCell.y - 6)
      this.house.visible = true
      this.house.scale.set(0)
      this.track(gsap.to(this.house.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out(1.8)' }))
    }
  }

  hopSister(dir: number): void {
    this.col += DIR_DELTA[dir][0]
    this.row += DIR_DELTA[dir][1]
    const cell = this.cells[this.row]?.[this.col]
    if (!cell || !this.sisters) return
    const sisters = this.sisters
    const timeline = gsap.timeline()
    timeline.to(sisters, { x: cell.x, duration: 0.34, ease: 'power1.inOut' })
    timeline.to(sisters, { y: cell.y - HOP, duration: 0.17, ease: 'sine.out' }, '<')
    timeline.to(sisters, { y: cell.y, duration: 0.17, ease: 'sine.in' }, '>')
    this.track(timeline)
  }

  resetSister(): void {
    const start = this.cells[this.startRow][this.startCol]
    if (this.sisters) this.track(gsap.to(this.sisters, { x: start.x, y: start.y, duration: 0.3, ease: 'power2.inOut' }))
    this.col = this.startCol
    this.row = this.startRow
  }

  celebrate(): void {
    if (this.sisters) this.track(gsap.to(this.sisters.scale, { x: 1.25, y: 1.25, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
    if (this.house) this.track(gsap.to(this.house.scale, { x: 1.2, y: 1.2, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
  }

  destroy(): void {
    this.tweens.forEach((anim) => anim.kill())
    this.tweens.clear()
    this.sisters = null
    this.house = null
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
