<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.syllableTrain.title')"
    :prompt="$t('games.syllableTrain.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="train">
        <canvas ref="stage" class="train__stage"></canvas>
        <div class="train__choices">
          <button
            v-for="option in options"
            :key="option"
            class="train__choice"
            :class="{ 'train__choice--wrong': option === wrongValue }"
            type="button"
            :disabled="isBusy || isAnimating"
            @click="pick(option, submit)"
          >
            {{ option }}
          </button>
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

import { shuffle } from '@/utils/shuffle'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { SYLLABLE_ROUNDS } from '@/constants/gameConfig'
import { SYLLABLE_WORDS } from '@/constants/words'
import type { WordCard } from '@/constants/words'
import { DEFAULT_PROFILE_ID, LOCALE } from '@/constants/strings'
import type { Locale } from '@/constants/strings'

import { TrainScene } from './trainScene'

type SubmitFn = (isCorrect: boolean) => void

function emptyCard(): WordCard {
  return { word: '', picture: '', missingIndex: 0, options: ['', '', ''] }
}

export default defineComponent({
  name: 'SyllableTrainGame',
  components: { GameShell },
  data() {
    return {
      card: emptyCard(),
      options: [] as string[],
      wrongValue: null as string | null,
      isAnimating: false,
      recent: [] as string[],
      scene: null as TrainScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return SYLLABLE_ROUNDS
    },
    locale(): Locale {
      return this.$i18n.locale as Locale
    },
    pool(): WordCard[] {
      return SYLLABLE_WORDS[this.locale]
    },
    rtl(): boolean {
      return this.locale === LOCALE.HE
    },
    correctLetter(): string {
      return this.card.word[this.card.missingIndex]
    },
    speechParts(): string[] {
      return [this.$t('games.syllableTrain.instruction'), this.card.word]
    }
  },
  created() {
    this.pickCard()
  },
  async mounted() {
    // markRaw is essential: without it Vue makes the whole Pixi object tree
    // reactive, and GSAP tweening the proxies corrupts Pixi and crashes.
    const scene = markRaw(new TrainScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setWord(this.card, this.rtl)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickCard() {
      const pool = this.pool
      const ids = pool.map((word) => word.word)
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      const targetWord = pickNextItem(ids, stats, this.rng, this.recent)
      this.recent.push(targetWord)
      if (this.recent.length > ids.length - 1) this.recent.shift()
      this.card = pool.find((word) => word.word === targetWord) ?? pool[0]
      this.options = shuffle(this.card.options, this.rng)
      this.wrongValue = null
    },
    nextRound() {
      this.pickCard()
      this.scene?.setWord(this.card, this.rtl)
    },
    async pick(letter: string, submit: SubmitFn) {
      if (this.isAnimating) return
      const isCorrect = letter === this.correctLetter
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.card.word, isCorrect)
      if (!isCorrect) {
        this.wrongValue = letter
        window.setTimeout(() => {
          this.wrongValue = null
        }, 600)
        submit(false)
        return
      }
      this.isAnimating = true
      await this.scene?.fillLetter(letter)
      this.isAnimating = false
      submit(true)
      this.scene?.celebrate(this.card.picture)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.train {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 56rem;
    block-size: auto;
    aspect-ratio: 900 / 460;
    display: block;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }

  &__choices {
    display: flex;
    gap: var(--sp-md);
  }

  &__choice {
    @include flex-center;
    @include pressable;
    inline-size: 5.5rem;
    block-size: 5.5rem;
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--color-ink);
    background: var(--color-surface);
    transition: background var(--tr-fast), color var(--tr-fast);

    &--wrong {
      color: var(--color-white);
      background: var(--color-retry);
      animation: wiggle 0.45s ease both;
    }

    &:disabled {
      opacity: var(--op-strong);
    }
  }
}
</style>
