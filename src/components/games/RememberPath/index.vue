<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.rememberPath.title')"
    :prompt="$t('games.rememberPath.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="path">
      <canvas ref="stage" class="path__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { extendPath } from '@/utils/pathWalk'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'
import { pickStageSize, watchStageOrientation } from '@/utils/stageSize'

import {
  PATH_COLS,
  PATH_ROWS,
  PATH_SCENE_H,
  PATH_SCENE_PORTRAIT_H,
  PATH_SCENE_PORTRAIT_W,
  PATH_SCENE_W,
  PATH_START_LEN,
  REMEMBER_ROUNDS
} from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { PathScene } from './pathScene'

type Phase = 'watch' | 'repeat'

const START_COL = Math.floor(PATH_COLS / 2)
const START_ROW = Math.floor(PATH_ROWS / 2)
const FIRST_PLAY_MS = 700
const NEXT_PLAY_MS = 600
const RETRY_MS = 1000

export default defineComponent({
  name: 'RememberPathGame',
  components: { GameShell },
  data() {
    return {
      phase: 'watch' as Phase,
      sequence: [] as number[],
      inputIndex: 0,
      scene: null as PathScene | null,
      stopOrientation: null as (() => void) | null,
      timers: [] as ReturnType<typeof setTimeout>[],
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return REMEMBER_ROUNDS
    },
    speechParts(): string[] {
      return [this.$t('games.rememberPath.prompt')]
    }
  },
  created() {
    this.sequence = this.buildStart()
  },
  async mounted() {
    const size = this.stageSize()
    const scene = markRaw(new PathScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement, size.width, size.height)
    scene.setHandler(this.handleDir)
    this.scene = scene
    this.stopOrientation = watchStageOrientation(this.handleOrientation)
    this.timers.push(setTimeout(() => this.showSequence(), FIRST_PLAY_MS))
  },
  beforeUnmount() {
    this.clearTimers()
    this.stopOrientation?.()
    this.scene?.destroy()
  },
  methods: {
    stageSize() {
      return pickStageSize(
        { width: PATH_SCENE_W, height: PATH_SCENE_H },
        { width: PATH_SCENE_PORTRAIT_W, height: PATH_SCENE_PORTRAIT_H }
      )
    },
    handleOrientation() {
      const next = this.stageSize()
      this.scene?.resize(next.width, next.height)
      // Rebuilt grid resets the rabbit; replay the current path from the start.
      this.clearTimers()
      this.timers.push(setTimeout(() => this.showSequence(), NEXT_PLAY_MS))
    },
    buildStart(): number[] {
      let dirs: number[] = []
      for (let i = 0; i < PATH_START_LEN; i++) {
        dirs = extendPath(dirs, PATH_COLS, PATH_ROWS, START_COL, START_ROW, this.rng)
      }
      return dirs
    },
    clearTimers() {
      for (const timer of this.timers) clearTimeout(timer)
      this.timers = []
    },
    showSequence() {
      this.phase = 'watch'
      this.scene?.showPath(this.sequence, () => {
        this.phase = 'repeat'
        this.inputIndex = 0
        this.scene?.setInteractive(true)
      })
    },
    nextRound(round: number) {
      // Round 1 is a fresh start / Play Again: reseed to the short starting
      // path. Otherwise keep the path and add one step (grow-by-one).
      this.sequence =
        round <= 1 ? this.buildStart() : extendPath(this.sequence, PATH_COLS, PATH_ROWS, START_COL, START_ROW, this.rng)
      this.inputIndex = 0
      this.timers.push(setTimeout(() => this.showSequence(), NEXT_PLAY_MS))
    },
    handleDir(dir: number) {
      if (this.phase !== 'repeat') return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      if (dir === this.sequence[this.inputIndex]) {
        this.scene?.hopRabbit(dir)
        this.inputIndex += 1
        if (this.inputIndex >= this.sequence.length) {
          this.phase = 'watch'
          this.scene?.setInteractive(false)
          this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `path-${this.sequence.length}`, true)
          this.scene?.celebrate()
          shell.submit(true)
        }
        return
      }
      this.phase = 'watch'
      this.scene?.setInteractive(false)
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `path-${this.sequence.length}`, false)
      this.scene?.resetRabbit()
      shell.submit(false)
      this.timers.push(setTimeout(() => this.showSequence(), RETRY_MS))
    }
  }
})
</script>

<style lang="scss" scoped>
.path {
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 48rem;
    block-size: auto;
    aspect-ratio: 900 / 560;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
