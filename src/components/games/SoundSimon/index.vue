<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.soundSimon.title')"
    :prompt="$t('games.soundSimon.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="simon">
      <canvas ref="stage" class="simon__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { appendStep, generateToneSequence } from '@/utils/simonSequence'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'
import { pickStageSize, watchStageOrientation } from '@/utils/stageSize'

import {
  SIMON_GAP_MS,
  SIMON_PADS,
  SIMON_ROUNDS,
  SIMON_SCENE_H,
  SIMON_SCENE_PORTRAIT_H,
  SIMON_SCENE_PORTRAIT_W,
  SIMON_SCENE_W,
  SIMON_START_LEN
} from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { SimonScene } from './simonScene'

type Phase = 'watch' | 'repeat'

const LEAD_IN_MS = 500
const FIRST_PLAY_MS = 1600
const NEXT_PLAY_MS = 600
const RETRY_MS = 1100

export default defineComponent({
  name: 'SoundSimonGame',
  components: { GameShell },
  data() {
    return {
      phase: 'watch' as Phase,
      sequence: [] as number[],
      inputIndex: 0,
      scene: null as SimonScene | null,
      stopOrientation: null as (() => void) | null,
      timers: [] as ReturnType<typeof setTimeout>[],
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return SIMON_ROUNDS
    },
    speechParts(): string[] {
      return [this.$t('games.soundSimon.prompt')]
    }
  },
  created() {
    this.sequence = generateToneSequence(SIMON_START_LEN, SIMON_PADS, this.rng)
    this.inputIndex = 0
  },
  async mounted() {
    // markRaw is essential: without it Vue makes the whole Pixi object tree
    // reactive, and GSAP tweening the proxies corrupts Pixi and crashes.
    const size = this.stageSize()
    const scene = markRaw(new SimonScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement, size.width, size.height)
    scene.setHandler(this.handlePad)
    this.scene = scene
    this.stopOrientation = watchStageOrientation(() => {
      const next = this.stageSize()
      this.scene?.resize(next.width, next.height)
    })
    this.timers.push(setTimeout(() => this.playSequence(), FIRST_PLAY_MS))
  },
  beforeUnmount() {
    this.clearTimers()
    this.stopOrientation?.()
    this.scene?.destroy()
  },
  methods: {
    stageSize() {
      return pickStageSize(
        { width: SIMON_SCENE_W, height: SIMON_SCENE_H },
        { width: SIMON_SCENE_PORTRAIT_W, height: SIMON_SCENE_PORTRAIT_H }
      )
    },
    clearTimers() {
      for (const timer of this.timers) clearTimeout(timer)
      this.timers = []
    },
    playSequence() {
      this.phase = 'watch'
      this.scene?.setInteractive(false)
      this.clearTimers()
      this.sequence.forEach((pad, i) => {
        this.timers.push(setTimeout(() => this.scene?.activate(pad), LEAD_IN_MS + i * SIMON_GAP_MS))
      })
      this.timers.push(
        setTimeout(() => {
          this.phase = 'repeat'
          this.inputIndex = 0
          this.scene?.setInteractive(true)
        }, LEAD_IN_MS + this.sequence.length * SIMON_GAP_MS)
      )
    },
    nextRound(round: number) {
      // Round 1 is a fresh start / Play Again: reseed to the short starting
      // sequence. Otherwise classic Simon keeps the prefix and adds one step.
      this.sequence =
        round <= 1
          ? generateToneSequence(SIMON_START_LEN, SIMON_PADS, this.rng)
          : appendStep(this.sequence, SIMON_PADS, this.rng)
      this.inputIndex = 0
      this.timers.push(setTimeout(() => this.playSequence(), NEXT_PLAY_MS))
    },
    handlePad(pad: number) {
      if (this.phase !== 'repeat') return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      this.scene?.activate(pad)
      if (pad === this.sequence[this.inputIndex]) {
        this.inputIndex += 1
        if (this.inputIndex >= this.sequence.length) {
          this.phase = 'watch'
          this.scene?.setInteractive(false)
          this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `simon-${this.sequence.length}`, true)
          this.scene?.celebrate()
          shell.submit(true)
        }
        return
      }
      this.phase = 'watch'
      this.scene?.setInteractive(false)
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `simon-${this.sequence.length}`, false)
      shell.submit(false)
      this.timers.push(setTimeout(() => this.playSequence(), RETRY_MS))
    }
  }
})
</script>

<style lang="scss" scoped>
.simon {
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 46rem;
    block-size: auto;
    aspect-ratio: 900 / 540;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
