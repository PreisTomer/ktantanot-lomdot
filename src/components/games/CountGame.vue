<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell :title="$t('games.count.title')" :prompt="$t('games.count.prompt')" :rounds="rounds" @next="nextQuestion">
    <template #default="{ submit, isBusy }">
      <div class="count">
        <div class="count__objects" aria-hidden="true">
          <span v-for="i in count" :key="i" class="count__object">{{ icon }}</span>
        </div>
        <div class="count__options">
          <OptionTile
            v-for="option in optionLabels"
            :key="option"
            :label="option"
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
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'
import OptionTile from '@/components/OptionTile.vue'

import { buildChoices } from '@/utils/options'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { ANSWER_OPTIONS, COUNT_MAX, ROUNDS_PER_SESSION, WRONG_FEEDBACK_MS } from '@/constants/gameConfig'
import { COUNT_ICONS } from '@/constants/gameAssets'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

type SubmitFn = (isCorrect: boolean) => void

const COUNT_POOL: number[] = Array.from({ length: COUNT_MAX }, (_, i) => i + 1)

export default defineComponent({
  name: 'CountGame',
  components: { GameShell, OptionTile },
  data() {
    return {
      count: 1,
      icon: COUNT_ICONS[0] as string,
      options: [] as number[],
      wrongValue: null as string | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return ROUNDS_PER_SESSION
    },
    optionLabels(): string[] {
      return this.options.map((option) => String(option))
    }
  },
  created() {
    this.nextQuestion()
  },
  methods: {
    nextQuestion() {
      this.count = COUNT_POOL[Math.floor(this.rng() * COUNT_POOL.length)]
      this.icon = COUNT_ICONS[Math.floor(this.rng() * COUNT_ICONS.length)]
      this.options = buildChoices(this.count, COUNT_POOL, ANSWER_OPTIONS, this.rng)
      this.wrongValue = null
    },
    handlePick(value: string, submit: SubmitFn) {
      const isCorrect = Number(value) === this.count
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `count-${this.count}`, isCorrect)
      if (!isCorrect) {
        this.wrongValue = value
        setTimeout(() => {
          this.wrongValue = null
        }, WRONG_FEEDBACK_MS)
      }
      submit(isCorrect)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.count {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__objects {
    @include flex-center;
    flex-wrap: wrap;
    gap: var(--sp-sm);
    max-inline-size: 30rem;
  }

  &__object {
    font-size: var(--fs-xl);
    @include ambient(float, 5s);
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-md);
    inline-size: 100%;

    @media (min-width: 720px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
