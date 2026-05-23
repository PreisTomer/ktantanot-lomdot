<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="shell">
    <GameHeader :title="title" :prompt="prompt" :parts="speechParts" />
    <ProgressDots class="shell__dots" :total="rounds" :current="completedRounds" />

    <div v-if="isFinished" class="shell__finish">
      <p class="shell__finish-text">{{ $t('games.finished') }}</p>
      <div class="shell__actions">
        <button class="shell__action shell__action--again" type="button" @click="replay">
          <span class="shell__action-icon">{{ icon.STAR }}</span>
          <span>{{ $t('games.playAgain') }}</span>
        </button>
        <button class="shell__action" type="button" @click="goToWorld">
          <span class="shell__action-icon">{{ worldIcon }}</span>
          <span>{{ $t('games.anotherGame') }}</span>
        </button>
        <button class="shell__action" type="button" @click="goToHub">
          <span class="shell__action-icon">{{ icon.HOME }}</span>
          <span>{{ $t('games.anotherWorld') }}</span>
        </button>
      </div>
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
import { ROUTE } from '@/constants/strings'
import type { GameId } from '@/constants/strings'
import { findWorldForGame } from '@/constants/worlds'

const PRAISE = [
  PHRASE.amazing,
  PHRASE.wellDone,
  PHRASE.superStar,
  PHRASE.brilliant,
  PHRASE.keepItUp,
  PHRASE.champion
]

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
    completedRounds(): number {
      return this.isFinished ? this.rounds : this.current - 1
    },
    worldId(): string | undefined {
      return findWorldForGame(this.$route.params.gameId as GameId)?.id
    },
    worldIcon(): string {
      return findWorldForGame(this.$route.params.gameId as GameId)?.icon ?? ICON.STAR
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
    },
    goToWorld() {
      if (this.worldId) {
        this.$router.push({ name: ROUTE.WORLD, params: { worldId: this.worldId } })
        return
      }
      this.goToHub()
    },
    goToHub() {
      this.$router.push({ name: ROUTE.HUB })
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

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--sp-md);
  }

  &__action {
    @include flex-column-center;
    @include pressable;
    gap: var(--sp-xs);
    min-inline-size: 9rem;
    padding: var(--sp-md) var(--sp-lg);
    font-size: var(--fs-sm);
    font-weight: 700;
    color: var(--color-ink);
    background: var(--color-surface);

    &--again {
      color: var(--color-white);
      background: var(--color-primary);
    }

    &-icon {
      font-size: var(--fs-lg);
      @include ambient(pulse, 3s);
    }
  }
}
</style>
