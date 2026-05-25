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
const BANDS = 10
const SKY_TOP = '#bfe9ff'
const SKY_BOTTOM = '#e7f7ff'
const CELL = 84
const HOP = 30
const GROUND_Y = PATH_SCENE_H * 0.34
const ARROW_TRIANGLES: number[][] = [
  [0, -16, 15, 11, -15, 11],
  [0, 16, 15, -11, -15, -11],
  [-16, 0, 11, -15, 11, 15],
  [16, 0, -11, -15, -11, 15]
]

// משימת האחיות scene: a real path home — stone path tiles on grass, trees, and
// a little house at the destination. The sisters walk the path tile by tile.
// markRaw in the component; tracked tweens.
export class SistersScene {
  private app: Application | null = null
  private sisters: Text | null = null
  private house: Container | null = null
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
    this.buildScenery()
    this.buildPathTiles()
    this.buildHouse()
    this.buildSisters()
    this.buildPad()
  }

  private buildScenery(): void {
    if (!this.app) return
    const sky = new Graphics()
    const bandHeight = GROUND_Y / BANDS
    for (let i = 0; i < BANDS; i++) {
      const color = lerpColor(SKY_TOP, SKY_BOTTOM, i / (BANDS - 1))
      sky.rect(0, i * bandHeight, PATH_SCENE_W, bandHeight + 1).fill({ color })
    }
    sky.rect(0, GROUND_Y, PATH_SCENE_W, PATH_SCENE_H - GROUND_Y).fill({ color: SCENE.grass })
    sky.rect(0, GROUND_Y, PATH_SCENE_W, 10).fill({ color: SCENE.grassDeep, alpha: 0.4 })
    this.app.stage.addChild(sky)

    // A few trees for life, flanking the path.
    for (const tx of [60, PATH_SCENE_W - 60]) {
      const tree = new Text({ text: '🌳', style: { fontFamily: FONT, fontSize: 84 } })
      tree.anchor.set(0.5)
      tree.position.set(tx, GROUND_Y + 40)
      this.app.stage.addChild(tree)
    }
  }

  private buildPathTiles(): void {
    if (!this.app) return
    const gridW = PATH_COLS * CELL
    const x0 = (PATH_SCENE_W - gridW) / 2
    const y0 = GROUND_Y - CELL * 0.4
    const tileTop = lerpColor(SCENE.path, '#ffffff', 0.18)
    const tiles = new Graphics()
    for (let r = 0; r < PATH_ROWS; r++) {
      const rowCells: { x: number; y: number }[] = []
      for (let c = 0; c < PATH_COLS; c++) {
        const x = x0 + c * CELL + CELL / 2
        const y = y0 + r * CELL + CELL / 2
        tiles.roundRect(x - 36, y - 30, 72, 60, 14).fill({ color: SCENE.pathEdge })
        tiles.roundRect(x - 34, y - 30, 68, 54, 12).fill({ color: SCENE.path })
        tiles.roundRect(x - 30, y - 26, 60, 18, 9).fill({ color: tileTop, alpha: 0.6 })
        rowCells.push({ x, y })
      }
      this.cells.push(rowCells)
    }
    tiles.filters = [new DropShadowFilter({ alpha: 0.18, blur: 4 })]
    this.app.stage.addChild(tiles)
  }

  private drawHouse(): Container {
    const house = new Container()
    house.addChild(new Graphics().ellipse(0, 4, 40, 10).fill({ color: SCENE.wheel, alpha: 0.16 }))
    house.addChild(new Graphics().roundRect(-30, -52, 60, 56, 6).fill({ color: SCENE.carEmpty }))
    house.addChild(new Graphics().poly([-38, -50, 38, -50, 0, -86]).fill({ color: SCENE.roof }))
    house.addChild(new Graphics().roundRect(-11, -26, 22, 30, 4).fill({ color: SCENE.doorBrown }))
    house.addChild(new Graphics().circle(6, -11, 2).fill({ color: SCENE.headlight })) // door knob
    house.addChild(new Graphics().roundRect(-22, -44, 16, 16, 3).fill({ color: SCENE.trainWindow }))
    house.addChild(new Graphics().roundRect(8, -44, 16, 16, 3).fill({ color: SCENE.trainWindow }))
    house.filters = [new DropShadowFilter({ alpha: 0.28, blur: 3 })]
    return house
  }

  private buildHouse(): void {
    if (!this.app) return
    const house = this.drawHouse()
    house.visible = false
    this.app.stage.addChild(house)
    this.house = house
  }

  private buildSisters(): void {
    if (!this.app) return
    const sisters = new Text({ text: '👭', style: { fontFamily: FONT, fontSize: 52 } })
    sisters.anchor.set(0.5)
    const start = this.cells[this.startRow][this.startCol]
    sisters.position.set(start.x, start.y - 16)
    sisters.filters = [new DropShadowFilter({ alpha: 0.3, blur: 2 })]
    this.app.stage.addChild(sisters)
    this.sisters = sisters
  }

  private buildPad(): void {
    if (!this.app) return
    const cx = PATH_SCENE_W / 2
    const cy = PATH_SCENE_H - 88
    const offsets: [number, number][] = [
      [0, -62],
      [0, 62],
      [-70, 0],
      [70, 0]
    ]
    for (let dir = 0; dir < 4; dir++) {
      const pad = new Container()
      const bg = new Graphics().roundRect(-33, -33, 66, 66, 18).fill({ color: SCENE.trainCar })
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
    this.sisters?.position.set(start.x, start.y - 16)

    const positions = walkPositions(this.startCol, this.startRow, dirs)
    const [endCol, endRow] = positions[positions.length - 1]
    const endCell = this.cells[endRow][endCol]
    if (this.house) {
      this.house.position.set(endCell.x, endCell.y - 14)
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
    const baseY = cell.y - 16
    const timeline = gsap.timeline()
    timeline.to(sisters, { x: cell.x, duration: 0.32, ease: 'power1.inOut' })
    timeline.to(sisters, { y: baseY - HOP, duration: 0.16, ease: 'sine.out' }, '<')
    timeline.to(sisters, { y: baseY, duration: 0.16, ease: 'sine.in' }, '>')
    this.track(timeline)
  }

  // Wrong direction: shake the tapped arrow; the sisters stay put.
  nudgeArrow(dir: number): void {
    const pad = this.arrows[dir]
    if (!pad) return
    this.track(gsap.fromTo(pad, { rotation: -0.12 }, { rotation: 0.12, duration: 0.07, yoyo: true, repeat: 3, ease: 'sine.inOut', onComplete: () => (pad.rotation = 0) }))
  }

  celebrate(): void {
    if (this.sisters) this.track(gsap.to(this.sisters.scale, { x: 1.25, y: 1.25, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }))
    if (this.house) this.track(gsap.to(this.house, { y: this.house.y - 12, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }))
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
