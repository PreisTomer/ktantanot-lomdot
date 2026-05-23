<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.bearRestaurant.title')"
    :prompt="$t('games.bearRestaurant.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="bear">
        <canvas ref="stage" class="bear__stage"></canvas>
        <div class="bear__options">
          <OptionTile
            v-for="option in optionLabels"
            :key="option"
            :label="option"
            :shake="option === wrongValue"
            :disabled="isBusy || !canAnswer"
            @pick="(value: string) => handlePick(value, submit)"
          />
        </div>
      </div>
    </template>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'
import OptionTile from '@/components/OptionTile.vue'

import { generateAddition } from '@/utils/arithmetic'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { BEAR_MAX_SUM, BEAR_ROUNDS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { BearScene } from './bearScene'

type SubmitFn = (isCorrect: boolean) => void

export default defineComponent({
  name: 'BearRestaurantGame',
  components: { GameShell, OptionTile },
  data() {
    return {
      a: 1,
      b: 1,
      answer: 2,
      options: [] as number[],
      recent: [] as number[],
      wrongValue: null as string | null,
      canAnswer: false,
      scene: null as BearScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return BEAR_ROUNDS
    },
    optionLabels(): string[] {
      return this.options.map((option) => String(option))
    },
    speechParts(): string[] {
      return [this.$t('games.bearRestaurant.story', { a: this.a, b: this.b }), this.$t('games.bearRestaurant.prompt')]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    const scene = markRaw(new BearScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.a, this.b, this.onReady)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    onReady() {
      this.canAnswer = true
    },
    pickRound() {
      let problem = generateAddition(BEAR_MAX_SUM, this.rng)
      let guard = 0
      while ((problem.a < 1 || problem.b < 1 || this.recent.includes(problem.answer)) && guard < 30) {
        problem = generateAddition(BEAR_MAX_SUM, this.rng)
        guard++
      }
      this.a = problem.a
      this.b = problem.b
      this.answer = problem.answer
      this.options = problem.options
      this.wrongValue = null
      this.recent.push(problem.answer)
      if (this.recent.length > 3) this.recent.shift()
    },
    nextRound() {
      this.canAnswer = false
      this.pickRound()
      this.scene?.setRound(this.a, this.b, this.onReady)
    },
    handlePick(value: string, submit: SubmitFn) {
      if (!this.canAnswer) return
      const isCorrect = Number(value) === this.answer
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `bear-${this.a}-${this.b}`, isCorrect)
      if (!isCorrect) {
        this.wrongValue = value
        window.setTimeout(() => {
          this.wrongValue = null
        }, 600)
        submit(false)
        return
      }
      this.scene?.cheer()
      submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.bear {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 560;
    display: block;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    touch-action: none;
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sp-md);
    inline-size: 100%;
    max-inline-size: 32rem;
  }
}
</style>
