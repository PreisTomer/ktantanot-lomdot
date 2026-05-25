<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.sistersMission.title')"
    :prompt="prompt"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="sisters">
      <div v-if="phase === 'read'" class="sisters__clue">
        <div class="sisters__chips">
          <span v-for="(dir, index) in dirs" :key="index" class="sisters__chip">
            <span class="sisters__chip-arrow">{{ arrow(dir) }}</span>
            <span>{{ dirWord(dir) }}</span>
          </span>
        </div>
        <button class="sisters__go" type="button" @click="startWalk">{{ $t('games.sistersMission.go') }}</button>
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

import { PATH_COLS, PATH_ROWS, SISTERS_PATH_LEN, SISTERS_ROUNDS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { SistersScene } from './sistersScene'

type Phase = 'read' | 'walk'

const START_COL = Math.floor(PATH_COLS / 2)
const START_ROW = Math.floor(PATH_ROWS / 2)
const DIR_KEYS = ['up', 'down', 'left', 'right']
const DIR_ARROWS = ['⬆️', '⬇️', '⬅️', '➡️']

export default defineComponent({
  name: 'SistersMissionGame',
  components: { GameShell },
  data() {
    return {
      phase: 'read' as Phase,
      dirs: [] as number[],
      inputIndex: 0,
      scene: null as SistersScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return SISTERS_ROUNDS
    },
    prompt(): string {
      return this.phase === 'read'
        ? this.$t('games.sistersMission.readPrompt')
        : this.$t('games.sistersMission.walkPrompt')
    },
    speechParts(): string[] {
      return [this.prompt]
    }
  },
  created() {
    this.dirs = this.buildPath()
  },
  async mounted() {
    const scene = markRaw(new SistersScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setHandler(this.handleDir)
    scene.setRound(this.dirs)
    scene.setInteractive(false)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
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
    startWalk() {
      this.phase = 'walk'
      this.inputIndex = 0
      this.scene?.setInteractive(true)
    },
    nextRound() {
      this.dirs = this.buildPath()
      this.inputIndex = 0
      this.phase = 'read'
      this.scene?.setInteractive(false)
      this.scene?.setRound(this.dirs)
    },
    handleDir(dir: number) {
      if (this.phase !== 'walk') return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      if (dir === this.dirs[this.inputIndex]) {
        this.scene?.hopSister(dir)
        this.inputIndex += 1
        if (this.inputIndex >= this.dirs.length) {
          this.scene?.setInteractive(false)
          this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `sisters-${this.dirs.length}`, true)
          this.scene?.celebrate()
          shell.submit(true)
        }
        return
      }
      this.scene?.setInteractive(false)
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `sisters-${this.dirs.length}`, false)
      this.scene?.resetSister()
      this.phase = 'read'
      shell.submit(false)
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
    @include flex-column-center;
    gap: var(--sp-md);
  }

  &__chips {
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

    &-arrow {
      font-size: var(--fs-lg);
    }
  }

  &__go {
    @include flex-center;
    @include pressable;
    padding: var(--sp-sm) var(--sp-xl);
    font-size: var(--fs-md);
    font-weight: 700;
    color: var(--color-white);
    background: var(--color-primary);
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
