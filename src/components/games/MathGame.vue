<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell :title="$t(`games.${mode}.title`)" :prompt="promptText" :rounds="rounds" @next="nextQuestion">
    <template #default="{ submit, isBusy }">
      <div class="math">
        <p class="math__expr" dir="ltr">{{ problem.a }} {{ sign }} {{ problem.b }} =</p>
        <div class="math__options">
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
import type { PropType } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'
import OptionTile from '@/components/OptionTile.vue'

import { generateAddition, generateSubtraction } from '@/utils/arithmetic'
import type { ArithmeticProblem } from '@/utils/arithmetic'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { MATH_MAX_SUM, ROUNDS_PER_SESSION, WRONG_FEEDBACK_MS } from '@/constants/gameConfig'
import { ICON } from '@/constants/icons'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

type SubmitFn = (isCorrect: boolean) => void
type MathMode = 'add' | 'subtract'

function emptyProblem(): ArithmeticProblem {
  return { a: 0, b: 0, answer: 0, options: [] }
}

export default defineComponent({
  name: 'MathGame',
  components: { GameShell, OptionTile },
  props: {
    mode: {
      type: String as PropType<MathMode>,
      required: true
    }
  },
  data() {
    return {
      problem: emptyProblem(),
      wrongValue: null as string | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return ROUNDS_PER_SESSION
    },
    sign(): string {
      return this.mode === 'add' ? ICON.PLUS : ICON.MINUS
    },
    optionLabels(): string[] {
      return this.problem.options.map((option) => String(option))
    },
    promptText(): string {
      return this.$t(`games.${this.mode}.prompt`, { a: this.problem.a, b: this.problem.b })
    }
  },
  created() {
    this.nextQuestion()
  },
  methods: {
    nextQuestion() {
      this.problem =
        this.mode === 'add'
          ? generateAddition(MATH_MAX_SUM, this.rng)
          : generateSubtraction(MATH_MAX_SUM, this.rng)
      this.wrongValue = null
    },
    handlePick(value: string, submit: SubmitFn) {
      const isCorrect = Number(value) === this.problem.answer
      const itemId = `${this.problem.a}${this.mode}${this.problem.b}`
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, itemId, isCorrect)
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

.math {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__expr {
    margin: 0;
    font-size: var(--fs-display);
    font-weight: 700;
    color: var(--color-ink);
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
