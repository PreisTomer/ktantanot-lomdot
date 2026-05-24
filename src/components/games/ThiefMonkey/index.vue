<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.thiefMonkey.title')"
    :prompt="$t('games.thiefMonkey.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="monkey">
        <canvas ref="stage" class="monkey__stage"></canvas>
        <div class="monkey__options">
          <OptionTile
            v-for="(option, i) in optionLabels"
            :key="option"
            :label="option"
            :tone="tones[i % tones.length]"
            :shake="option === wrongValue"
            :disabled="isBusy"
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

import { generateSubtraction } from '@/utils/arithmetic'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { TILE_TONES } from '@/theme/colors'

import { MONKEY_MAX, MONKEY_ROUNDS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { MonkeyScene } from './monkeyScene'

type SubmitFn = (isCorrect: boolean) => void

export default defineComponent({
  name: 'ThiefMonkeyGame',
  components: { GameShell, OptionTile },
  data() {
    return {
      total: 4,
      stolen: 1,
      answer: 3,
      options: [] as number[],
      wrongValue: null as string | null,
      scene: null as MonkeyScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return MONKEY_ROUNDS
    },
    optionLabels(): string[] {
      return this.options.map((option) => String(option))
    },
    tones(): readonly string[] {
      return TILE_TONES
    },
    speechParts(): string[] {
      return [this.$t('games.thiefMonkey.story', { stolen: this.stolen }), this.$t('games.thiefMonkey.prompt')]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    const scene = markRaw(new MonkeyScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.total, this.stolen)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      // total >= 2, 1 <= stolen < total, so the answer is always between 1 and
      // total-1 (the monkey never takes them all — no "0" answers).
      let problem = generateSubtraction(MONKEY_MAX, this.rng)
      while (problem.a < 2 || problem.b < 1 || problem.b >= problem.a) {
        problem = generateSubtraction(MONKEY_MAX, this.rng)
      }
      this.total = problem.a
      this.stolen = problem.b
      this.answer = problem.answer
      this.options = problem.options
      this.wrongValue = null
    },
    nextRound() {
      this.pickRound()
      this.scene?.setRound(this.total, this.stolen)
    },
    handlePick(value: string, submit: SubmitFn) {
      const isCorrect = Number(value) === this.answer
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `monkey-${this.total}-${this.stolen}`, isCorrect)
      if (!isCorrect) {
        this.wrongValue = value
        window.setTimeout(() => {
          this.wrongValue = null
        }, 600)
        submit(false)
        return
      }
      this.scene?.reveal()
      this.scene?.cheer()
      submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.monkey {
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
