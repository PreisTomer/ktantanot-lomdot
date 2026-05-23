<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="pairs">
    <GameHeader :title="$t('games.matchPairs.title')" :prompt="$t('games.matchPairs.prompt')" />

    <div class="pairs__grid">
      <button
        v-for="(card, index) in cards"
        :key="card.key"
        class="pairs__card"
        :class="{ 'pairs__card--up': card.isFlipped || card.isMatched, 'pairs__card--matched': card.isMatched }"
        type="button"
        :disabled="card.isMatched"
        @click="flip(index)"
      >
        <span class="pairs__face">{{ card.isFlipped || card.isMatched ? card.icon : icon.STAR }}</span>
      </button>
    </div>

    <button v-if="isComplete" class="pairs__again" type="button" @click="reset">
      {{ $t('games.playAgain') }}
    </button>

    <RewardOverlay v-if="isComplete" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import { audio } from '@/services/audio'

import GameHeader from '@/components/GameHeader.vue'
import RewardOverlay from '@/components/RewardOverlay/index.vue'

import { shuffle } from '@/utils/shuffle'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { FLIP_BACK_MS, MATCH_PAIRS } from '@/constants/gameConfig'
import { MEMORY_ICONS } from '@/constants/gameAssets'
import { ICON } from '@/constants/icons'
import { PHRASE } from '@/constants/phrases'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

interface Card {
  key: number
  icon: string
  isFlipped: boolean
  isMatched: boolean
}

export default defineComponent({
  name: 'MatchPairsGame',
  components: { GameHeader, RewardOverlay },
  data() {
    return {
      cards: [] as Card[],
      firstIndex: null as number | null,
      isBusy: false,
      isComplete: false,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    icon() {
      return ICON
    }
  },
  created() {
    this.deal()
  },
  mounted() {
    audio.speak(this.$t('games.matchPairs.prompt'))
  },
  methods: {
    deal() {
      const picks = shuffle([...MEMORY_ICONS], this.rng).slice(0, MATCH_PAIRS)
      const deck = shuffle([...picks, ...picks], this.rng)
      this.cards = deck.map((symbol, index) => ({
        key: index,
        icon: symbol,
        isFlipped: false,
        isMatched: false
      }))
    },
    flip(index: number) {
      if (this.isBusy || this.isComplete) return
      const card = this.cards[index]
      if (card.isFlipped || card.isMatched) return
      card.isFlipped = true

      if (this.firstIndex === null) {
        this.firstIndex = index
        return
      }
      this.resolvePair(this.firstIndex, index)
    },
    resolvePair(firstIndex: number, secondIndex: number) {
      const first = this.cards[firstIndex]
      const second = this.cards[secondIndex]
      this.firstIndex = null

      if (first.icon === second.icon) {
        first.isMatched = true
        second.isMatched = true
        this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `pair-${first.icon}`, true)
        audio.playPhrase(PHRASE.wellDone)
        this.checkComplete()
        return
      }

      this.isBusy = true
      audio.playPhrase(PHRASE.almost)
      setTimeout(() => {
        first.isFlipped = false
        second.isFlipped = false
        this.isBusy = false
      }, FLIP_BACK_MS)
    },
    checkComplete() {
      if (this.cards.every((card) => card.isMatched)) {
        this.isComplete = true
        audio.playPhrase(PHRASE.superStar)
      }
    },
    reset() {
      this.isComplete = false
      this.firstIndex = null
      this.isBusy = false
      this.deal()
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.pairs {
  inline-size: 100%;
  max-inline-size: 36rem;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--sp-md);
  }

  &__card {
    @include flex-center;
    @include pressable;
    aspect-ratio: 1;
    background: var(--color-grape);

    &--up {
      background: var(--color-surface);
    }

    &--matched {
      background: color-mix(in srgb, var(--color-correct) 25%, var(--color-surface));
    }
  }

  &__face {
    font-size: var(--fs-xl);
  }

  &__again {
    @include flex-center;
    @include pressable;
    margin-block-start: var(--sp-lg);
    margin-inline: auto;
    padding: var(--sp-md) var(--sp-lg);
    font-size: var(--fs-md);
    font-weight: 700;
    color: var(--color-white);
    background: var(--color-primary);
  }
}
</style>
