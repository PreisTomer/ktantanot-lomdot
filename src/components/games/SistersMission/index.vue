<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.sistersMission.title')"
    :prompt="$t('games.sistersMission.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="sisters">
      <div class="sisters__clue">
        <span
          v-for="(dir, index) in dirs"
          :key="index"
          class="sisters__chip"
          :class="{ 'sisters__chip--done': index < inputIndex }"
        >
          <span class="sisters__chip-arrow">{{ arrow(dir) }}</span>
          <span>{{ dirWord(dir) }}</span>
        </span>
      </div>
      <canvas ref="stage" class="sisters__stage"></canvas>
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
  PATH_SCENE_W,
  SISTERS_PATH_LEN,
  SISTERS_ROUNDS,
  SISTERS_SCENE_PORTRAIT_H,
  SISTERS_SCENE_PORTRAIT_W
} from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { SistersScene } from './sistersScene'

const START_COL = Math.floor(PATH_COLS / 2)
const START_ROW = Math.floor(PATH_ROWS / 2)
const DIR_KEYS = ['up', 'down', 'left', 'right']
const DIR_ARROWS = ['⬆️', '⬇️', '⬅️', '➡️']

export default defineComponent({
  name: 'SistersMissionGame',
  components: { GameShell },
  data() {
    return {
      dirs: [] as number[],
      inputIndex: 0,
      busy: false,
      scene: null as SistersScene | null,
      stopOrientation: null as (() => void) | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return SISTERS_ROUNDS
    },
    speechParts(): string[] {
      return [this.$t('games.sistersMission.prompt'), ...this.dirs.map((dir) => this.dirWord(dir))]
    }
  },
  created() {
    this.dirs = this.buildPath()
  },
  async mounted() {
    const size = this.stageSize()
    const scene = markRaw(new SistersScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement, size.width, size.height)
    scene.setHandler(this.handleDir)
    scene.setRound(this.dirs)
    scene.setInteractive(true)
    this.scene = scene
    this.stopOrientation = watchStageOrientation(this.handleOrientation)
  },
  beforeUnmount() {
    this.stopOrientation?.()
    this.scene?.destroy()
  },
  methods: {
    stageSize() {
      return pickStageSize(
        { width: PATH_SCENE_W, height: PATH_SCENE_H },
        { width: SISTERS_SCENE_PORTRAIT_W, height: SISTERS_SCENE_PORTRAIT_H }
      )
    },
    handleOrientation() {
      const next = this.stageSize()
      this.scene?.resize(next.width, next.height)
      this.inputIndex = 0
      this.busy = false
      this.scene?.setRound(this.dirs)
      this.scene?.setInteractive(true)
    },
    buildPath(): number[] {
      let dirs: number[] = []
      for (let i = 0; i < SISTERS_PATH_LEN; i++) {
        dirs = extendPath(dirs, PATH_COLS, PATH_ROWS, START_COL, START_ROW, this.rng)
      }
      return dirs
    },
    arrow(dir: number): string {
      return DIR_ARROWS[dir]
    },
    dirWord(dir: number): string {
      return this.$t(`games.sistersMission.dir.${DIR_KEYS[dir]}`)
    },
    nextRound() {
      this.dirs = this.buildPath()
      this.inputIndex = 0
      this.busy = false
      this.scene?.setRound(this.dirs)
      this.scene?.setInteractive(true)
    },
    handleDir(dir: number) {
      if (this.busy) return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      if (dir !== this.dirs[this.inputIndex]) {
        // Wrong turn: gentle nudge, stay put, try again (no restart).
        this.scene?.nudgeArrow(dir)
        shell.submit(false)
        return
      }
      this.scene?.hopSister(dir)
      this.inputIndex += 1
      if (this.inputIndex >= this.dirs.length) {
        this.busy = true
        this.scene?.setInteractive(false)
        this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `sisters-${this.dirs.length}`, true)
        this.scene?.celebrate()
        shell.submit(true)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.sisters {
  @include flex-column-center;
  gap: var(--sp-md);
  inline-size: 100%;

  &__clue {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--sp-sm);
  }

  &__chip {
    @include flex-center;
    gap: var(--sp-xs);
    padding: var(--sp-sm) var(--sp-md);
    font-size: var(--fs-md);
    font-weight: 700;
    color: var(--color-ink);
    background: var(--color-surface);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);
    transition: background var(--tr-fast), opacity var(--tr-fast);

    &--done {
      background: color-mix(in srgb, var(--color-leaf) 45%, var(--color-surface));
      opacity: var(--op-strong);
    }

    &-arrow {
      font-size: var(--fs-lg);
    }
  }

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
