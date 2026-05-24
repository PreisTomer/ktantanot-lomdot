<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.whereHidden.title')"
    :prompt="$t('games.whereHidden.prompt')"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="cups">
      <canvas ref="stage" class="cups__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { generateShuffle } from '@/utils/cupShuffle'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { CUP_COUNT, SHUFFLE_ROUNDS, SWAP_COUNT } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { CupScene } from './cupScene'

export default defineComponent({
  name: 'WhereHiddenGame',
  components: { GameShell },
  data() {
    return {
      round: generateShuffle(CUP_COUNT, SWAP_COUNT, createRng(Date.now())),
      scene: null as CupScene | null,
      rng: createRng(Date.now() + 1) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return SHUFFLE_ROUNDS
    }
  },
  async mounted() {
    const scene = markRaw(new CupScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.round, this.handlePick)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      this.round = generateShuffle(CUP_COUNT, SWAP_COUNT, this.rng)
    },
    nextRound() {
      this.pickRound()
      this.scene?.setRound(this.round, this.handlePick)
    },
    handlePick(slot: number) {
      const isCorrect = slot === this.round.ballSlot
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, 'cup', isCorrect)
      this.scene?.reveal(slot, this.round.ballSlot)
      // Let the reveal play before the reward/feedback fires.
      window.setTimeout(() => {
        const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
        shell?.submit(isCorrect)
      }, 700)
    }
  }
})
</script>

<style lang="scss" scoped>
.cups {
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 460;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
