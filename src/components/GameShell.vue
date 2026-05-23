<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="shell">
    <GameHeader :title="title" :prompt="prompt" :parts="speechParts" />
    <ProgressDots class="shell__dots" :total="rounds" :current="current - 1" />

    <div v-if="isFinished" class="shell__finish">
      <p class="shell__finish-text">{{ $t('games.finished') }}</p>
      <button class="shell__again" type="button" @click="replay">
        <span class="shell__again-icon">{{ icon.STAR }}</span>
        <span>{{ $t('games.playAgain') }}</span>
      </button>
    </div>

    <div v-else class="shell__body">
      <slot :submit="submit" :isBusy="isBusy" />
    </div>

    <RewardOverlay v-if="isShowingReward" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import { audio } from '@/services/audio'

import GameHeader from '@/components/GameHeader.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardOverlay from '@/components/RewardOverlay/index.vue'

import { ICON } from '@/constants/icons'
import { PHRASE } from '@/constants/phrases'
import { REWARD_DURATION_MS } from '@/constants/gameConfig'

const PRAISE = [PHRASE.amazing, PHRASE.wellDone, PHRASE.superStar]

export default defineComponent({
  name: 'GameShell',
  components: { GameHeader, ProgressDots, RewardOverlay },
  props: {
    title: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true
    },
    speechParts: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    rounds: {
      type: Number,
      required: true
    }
  },
  emits: ['next', 'wrong', 'finished'],
  data() {
    return {
      current: 1,
      isBusy: false,
      isShowingReward: false,
      isFinished: false,
      rewardTimer: null as ReturnType<typeof setTimeout> | null
    }
  },
  computed: {
    icon() {
      return ICON
    },
    announceKey(): string {
      return this.speechParts.length > 0 ? this.speechParts.join('|') : this.prompt
    }
  },
  watch: {
    announceKey() {
      if (!this.isFinished) this.announce()
    }
  },
  mounted() {
    this.announce()
  },
  beforeUnmount() {
    if (this.rewardTimer) clearTimeout(this.rewardTimer)
  },
  methods: {
    announce() {
      if (this.speechParts.length > 0) {
        audio.speakParts(this.speechParts)
        return
      }
      audio.speak(this.prompt)
    },
    submit(isCorrect: boolean) {
      if (this.isBusy || this.isFinished) return
      if (!isCorrect) {
        audio.playPhrase(PHRASE.almost)
        this.$emit('wrong')
        return
      }
      this.isBusy = true
      this.isShowingReward = true
      audio.playPhrase(PRAISE[Math.floor(Math.random() * PRAISE.length)])
      this.rewardTimer = setTimeout(() => this.afterReward(), REWARD_DURATION_MS)
    },
    afterReward() {
      this.isShowingReward = false
      this.isBusy = false
      if (this.current >= this.rounds) {
        this.finish()
        return
      }
      this.current += 1
      this.$emit('next')
    },
    finish() {
      this.isFinished = true
      audio.playPhrase(PHRASE.superStar)
      this.$emit('finished')
    },
    replay() {
      this.current = 1
      this.isFinished = false
      this.$emit('next')
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.shell {
  inline-size: 100%;
  max-inline-size: 60rem;

  &__dots {
    justify-content: center;
    margin-block-end: var(--sp-lg);
  }

  &__body {
    @include flex-column-center;
    gap: var(--sp-lg);
  }

  &__finish {
    @include flex-column-center;
    gap: var(--sp-lg);
    text-align: center;
  }

  &__finish-text {
    margin: 0;
    font-size: var(--fs-lg);
    color: var(--color-ink);
  }

  &__again {
    @include flex-center;
    @include pressable;
    gap: var(--sp-sm);
    padding: var(--sp-md) var(--sp-lg);
    font-size: var(--fs-md);
    font-weight: 700;
    color: var(--color-white);
    background: var(--color-primary);

    &-icon {
      font-size: var(--fs-lg);
      @include ambient(pulse, 3s);
    }
  }
}
</style>
