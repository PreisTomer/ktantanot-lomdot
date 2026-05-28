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
            v-for="(option, i) in optionLabels"
            :key="option"
            :label="option"
            :tone="tones[i % tones.length]"
            :shake="option === wrongValue"
            :disabled="isBusy || isIntroPlaying"
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
import { pickStageSize } from '@/utils/stageSize'

import { TILE_TONES } from '@/theme/colors'

import {
  BEAR_MAX_SUM,
  BEAR_ROUNDS,
  BEAR_SCENE_H,
  BEAR_SCENE_PORTRAIT_H,
  BEAR_SCENE_PORTRAIT_W,
  BEAR_SCENE_W
} from '@/constants/gameConfig'
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
      scene: null as BearScene | null,
      mql: null as MediaQueryList | null,
      isIntroPlaying: true,
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
    tones(): readonly string[] {
      return TILE_TONES
    },
    speechParts(): string[] {
      return [this.$t('games.bearRestaurant.story', { a: this.a, b: this.b }), this.$t('games.bearRestaurant.prompt')]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    await this.buildScene()
    this.mql = window.matchMedia('(max-width: 600px) and (orientation: portrait)')
    this.mql.addEventListener('change', this.handleOrientation)
    await this.scene?.intro()
    this.isIntroPlaying = false
    this.scene?.setRound(this.a, this.b)
  },
  beforeUnmount() {
    this.mql?.removeEventListener('change', this.handleOrientation)
    this.scene?.destroy()
  },
  methods: {
    stageSize() {
      return pickStageSize(
        { width: BEAR_SCENE_W, height: BEAR_SCENE_H },
        { width: BEAR_SCENE_PORTRAIT_W, height: BEAR_SCENE_PORTRAIT_H }
      )
    },
    async buildScene() {
      const size = this.stageSize()
      const scene = markRaw(new BearScene())
      await scene.init(this.$refs.stage as HTMLCanvasElement, size.width, size.height)
      // setRound is deferred to mounted() so the bear's intro animation runs
      // first; cakes fly in only once the bear has greeted the child.
      this.scene = scene
    },
    handleOrientation() {
      const size = this.stageSize()
      this.scene?.resize(size.width, size.height)
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
      this.pickRound()
      this.scene?.setRound(this.a, this.b)
    },
    handlePick(value: string, submit: SubmitFn) {
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
