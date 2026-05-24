<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.completeSequence.title')"
    :prompt="$t('games.completeSequence.prompt')"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="pattern">
        <canvas ref="stage" class="pattern__stage"></canvas>
        <div class="pattern__options">
          <OptionTile
            v-for="(option, index) in options"
            :key="option"
            :label="option"
            :tone="tones[index % tones.length]"
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

import { generatePattern } from '@/utils/patternSequence'
import type { PatternRound } from '@/utils/patternSequence'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { COMPLETE_OPTIONS, COMPLETE_ROUNDS } from '@/constants/gameConfig'
import { PATTERN_ITEMS } from '@/constants/patternItems'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { PatternScene } from './patternScene'

const POOL = [...PATTERN_ITEMS]
const TONES = ['sky', 'coral', 'leaf', 'sun', 'grape']

function emptyRound(): PatternRound {
  return { sequence: [], missingIndex: 0, answer: '', options: [] }
}

export default defineComponent({
  name: 'CompleteSequenceGame',
  components: { GameShell, OptionTile },
  data() {
    return {
      round: emptyRound(),
      wrongValue: null as string | null,
      scene: null as PatternScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return COMPLETE_ROUNDS
    },
    options(): string[] {
      return this.round.options
    },
    tones(): string[] {
      return TONES
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    const scene = markRaw(new PatternScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.round.sequence, this.round.missingIndex)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      this.round = generatePattern(POOL, COMPLETE_OPTIONS, this.rng)
      this.wrongValue = null
    },
    nextRound() {
      this.pickRound()
      this.scene?.setRound(this.round.sequence, this.round.missingIndex)
    },
    handlePick(value: string, submit: (isCorrect: boolean) => void) {
      const isCorrect = value === this.round.answer
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, 'pattern', isCorrect)
      if (!isCorrect) {
        this.wrongValue = value
        window.setTimeout(() => {
          this.wrongValue = null
        }, 600)
        submit(false)
        return
      }
      this.scene?.reveal(this.round.answer)
      submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.pattern {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 420;
    display: block;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sp-md);
    inline-size: 100%;
    max-inline-size: 34rem;
  }
}
</style>
