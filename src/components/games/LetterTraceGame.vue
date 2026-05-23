<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell :title="$t('games.letterTrace.title')" :prompt="promptText" :rounds="rounds" @next="nextLetter">
    <template #default="{ submit, isBusy }">
      <div class="trace">
        <svg
          ref="board"
          class="trace__board"
          :viewBox="`0 0 ${viewBox} ${viewBox}`"
          @pointerdown="startStroke"
          @pointermove="extendStroke"
          @pointerup="endStroke"
          @pointerleave="endStroke"
        >
          <text class="trace__ghost" :x="viewBox / 2" :y="viewBox / 2" dominant-baseline="central" text-anchor="middle">
            {{ target }}
          </text>
          <path v-for="(path, index) in strokes" :key="index" :d="path" class="trace__ink" />
          <path v-if="currentPath" :d="currentPath" class="trace__ink" />
        </svg>
        <div class="trace__controls">
          <button class="trace__btn" type="button" @click="clear">{{ $t('games.letterTrace.clear') }}</button>
          <button class="trace__btn trace__btn--done" type="button" :disabled="isBusy" @click="finishLetter(submit)">
            {{ $t('games.letterTrace.done') }}
          </button>
        </div>
      </div>
    </template>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { strokeToPath } from '@/utils/freehand'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { TRACE_ROUNDS, TRACE_VIEWBOX } from '@/constants/gameConfig'
import { HEBREW_LETTERS } from '@/constants/alphabet'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

type SubmitFn = (isCorrect: boolean) => void

export default defineComponent({
  name: 'LetterTraceGame',
  components: { GameShell },
  data() {
    return {
      target: '',
      strokes: [] as string[],
      currentPoints: [] as number[][],
      isDrawing: false,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return TRACE_ROUNDS
    },
    viewBox(): number {
      return TRACE_VIEWBOX
    },
    currentPath(): string {
      return strokeToPath(this.currentPoints)
    },
    promptText(): string {
      return this.$t('games.letterTrace.prompt', { letter: this.target })
    }
  },
  created() {
    this.nextLetter()
  },
  methods: {
    nextLetter() {
      const letters = [...HEBREW_LETTERS]
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      this.target = pickNextItem(letters, stats, this.rng)
      this.clear()
    },
    toBoardPoint(event: PointerEvent): number[] {
      const board = this.$refs.board as SVGSVGElement
      const rect = board.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * this.viewBox
      const y = ((event.clientY - rect.top) / rect.height) * this.viewBox
      return [x, y]
    },
    startStroke(event: PointerEvent) {
      this.isDrawing = true
      this.currentPoints = [this.toBoardPoint(event)]
    },
    extendStroke(event: PointerEvent) {
      if (!this.isDrawing) return
      this.currentPoints = [...this.currentPoints, this.toBoardPoint(event)]
    },
    endStroke() {
      if (!this.isDrawing) return
      this.isDrawing = false
      const path = strokeToPath(this.currentPoints)
      if (path) this.strokes = [...this.strokes, path]
      this.currentPoints = []
    },
    clear() {
      this.strokes = []
      this.currentPoints = []
      this.isDrawing = false
    },
    finishLetter(submit: SubmitFn) {
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.target, true)
      submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.trace {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__board {
    inline-size: min(80vw, 22rem);
    block-size: min(80vw, 22rem);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    touch-action: none;
  }

  &__ghost {
    font-family: var(--font-rounded);
    font-size: 220px;
    font-weight: 700;
    fill: color-mix(in srgb, var(--color-ink) 14%, transparent);
  }

  &__ink {
    fill: var(--color-coral);
  }

  &__controls {
    display: flex;
    gap: var(--sp-md);
  }

  &__btn {
    @include flex-center;
    @include pressable;
    min-block-size: var(--touch-min);
    padding: var(--sp-sm) var(--sp-lg);
    font-size: var(--fs-sm);
    font-weight: 700;
    color: var(--color-ink);
    background: var(--color-surface);

    &--done {
      color: var(--color-white);
      background: var(--color-correct);
    }
  }
}
</style>
