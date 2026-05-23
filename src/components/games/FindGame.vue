<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell :title="$t(`${baseKey}.title`)" :prompt="promptText" :rounds="rounds" @next="nextQuestion">
    <template #default="{ submit, isBusy }">
      <div class="find">
        <OptionTile
          v-for="option in options"
          :key="option"
          :label="option"
          :shake="option === wrongValue"
          :disabled="isBusy"
          @pick="(value: string) => handlePick(value, submit)"
        />
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

import { buildChoices } from '@/utils/options'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { ANSWER_OPTIONS, ROUNDS_PER_SESSION, WRONG_FEEDBACK_MS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

type SubmitFn = (isCorrect: boolean) => void

export default defineComponent({
  name: 'FindGame',
  components: { GameShell, OptionTile },
  props: {
    pool: {
      type: Array as PropType<string[]>,
      required: true
    },
    baseKey: {
      type: String,
      required: true
    },
    paramName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      target: '',
      options: [] as string[],
      wrongValue: null as string | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return ROUNDS_PER_SESSION
    },
    promptText(): string {
      return this.$t(`${this.baseKey}.prompt`, { [this.paramName]: this.target })
    }
  },
  created() {
    this.nextQuestion()
  },
  methods: {
    nextQuestion() {
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      this.target = pickNextItem(this.pool, stats, this.rng)
      this.options = buildChoices(this.target, this.pool, ANSWER_OPTIONS, this.rng)
      this.wrongValue = null
    },
    handlePick(value: string, submit: SubmitFn) {
      const isCorrect = value === this.target
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.target, isCorrect)
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
.find {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-md);
  inline-size: 100%;

  @media (min-width: 720px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
