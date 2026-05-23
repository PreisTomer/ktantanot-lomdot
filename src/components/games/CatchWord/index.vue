<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.catchWord.title')"
    :prompt="$t('games.catchWord.prompt', { word: target })"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="catch">
      <canvas ref="stage" class="catch__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { buildChoices } from '@/utils/options'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { CATCH_BALLOONS, CATCH_ROUNDS } from '@/constants/gameConfig'
import { CATCH_WORDS } from '@/constants/words'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { BalloonScene } from './balloonScene'

export default defineComponent({
  name: 'CatchWordGame',
  components: { GameShell },
  data() {
    return {
      target: CATCH_WORDS[0],
      isAnimating: false,
      scene: null as BalloonScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return CATCH_ROUNDS
    },
    speechParts(): string[] {
      return [this.$t('games.catchWord.instruction'), this.target]
    }
  },
  created() {
    this.pickTarget()
  },
  async mounted() {
    const scene = new BalloonScene()
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.roundWords(), this.handleTap)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickTarget() {
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      this.target = pickNextItem(CATCH_WORDS, stats, this.rng)
    },
    roundWords(): string[] {
      return buildChoices(this.target, CATCH_WORDS, CATCH_BALLOONS, this.rng)
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
      const isCorrect = word === this.target
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.target, isCorrect)
      if (!isCorrect) {
        this.scene?.wobble(word)
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
.catch {
  inline-size: 100%;

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
