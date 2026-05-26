<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.catchWord.title')"
    :prompt="$t('games.catchWord.prompt', { word: target.word })"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="catch">
      <div class="catch__cue">
        <span class="catch__cue-label">{{ $t('games.catchWord.cue') }}</span>
        <span class="catch__cue-picture">{{ target.picture }}</span>
      </div>
      <canvas ref="stage" class="catch__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { buildChoices } from '@/utils/options'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { CATCH_BALLOONS, CATCH_ROUNDS } from '@/constants/gameConfig'
import { CATCH_WORDS } from '@/constants/words'
import type { PictureWord } from '@/constants/words'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'
import type { Locale } from '@/constants/strings'

import { BalloonScene } from './balloonScene'

export default defineComponent({
  name: 'CatchWordGame',
  components: { GameShell },
  data() {
    return {
      target: { word: '', picture: '' } as PictureWord,
      isAnimating: false,
      recent: [] as string[],
      scene: null as BalloonScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return CATCH_ROUNDS
    },
    locale(): Locale {
      return this.$i18n.locale as Locale
    },
    words(): PictureWord[] {
      return CATCH_WORDS[this.locale]
    },
    wordPool(): string[] {
      return this.words.map((entry) => entry.word)
    },
    speechParts(): string[] {
      return [this.$t('games.catchWord.instruction'), this.target.word]
    }
  },
  created() {
    this.pickTarget()
  },
  async mounted() {
    // markRaw is essential: without it Vue makes the whole Pixi object tree
    // reactive, and GSAP tweening the proxies corrupts Pixi and crashes.
    const scene = markRaw(new BalloonScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.roundWords(), this.handleTap)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickTarget() {
      const pool = this.wordPool
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      const word = pickNextItem(pool, stats, this.rng, this.recent)
      this.recent.push(word)
      if (this.recent.length > pool.length - 1) this.recent.shift()
      this.target = this.words.find((entry) => entry.word === word) ?? this.words[0]
    },
    roundWords(): string[] {
      return buildChoices(this.target.word, this.wordPool, CATCH_BALLOONS, this.rng)
    },
    nextRound() {
      this.pickTarget()
      this.isAnimating = false
      this.scene?.setRound(this.roundWords(), this.handleTap)
    },
    async handleTap(word: string) {
      if (this.isAnimating) return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      const isCorrect = word === this.target.word
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.target.word, isCorrect)
      if (!isCorrect) {
        this.scene?.floatAway(word)
        shell.submit(false)
        return
      }
      this.isAnimating = true
      await this.scene?.pop(word)
      shell.submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.catch {
  @include flex-column-center;
  gap: var(--sp-md);
  inline-size: 100%;

  &__cue {
    @include flex-center;
    gap: var(--sp-md);
    padding: var(--sp-sm) var(--sp-lg);
    background: var(--color-surface);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);

    &-label {
      font-size: var(--fs-sm);
      font-weight: 700;
      color: var(--color-ink-soft);
    }

    &-picture {
      font-size: var(--fs-xl);
      line-height: 1;
      @include ambient(pulse, 2.4s);
    }
  }

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 580;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
