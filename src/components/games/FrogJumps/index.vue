<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.frogJumps.title')"
    :prompt="$t('games.frogJumps.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="frog">
      <canvas ref="stage" class="frog__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { generateJump } from '@/utils/arithmetic'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { FROG_MAX, FROG_ROUNDS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { FrogScene } from './frogScene'

export default defineComponent({
  name: 'FrogJumpsGame',
  components: { GameShell },
  data() {
    return {
      start: 0,
      add: 1,
      target: 1,
      isAnimating: false,
      scene: null as FrogScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return FROG_ROUNDS
    },
    speechParts(): string[] {
      return [
        this.$t('games.frogJumps.story', { start: this.start, add: this.add }),
        this.$t('games.frogJumps.prompt')
      ]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    const scene = markRaw(new FrogScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.start, this.add, this.handlePick)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      const jump = generateJump(FROG_MAX, this.rng)
      this.start = jump.start
      this.add = jump.add
      this.target = jump.target
    },
    nextRound() {
      this.isAnimating = false
      this.pickRound()
      this.scene?.setRound(this.start, this.add, this.handlePick)
    },
    async handlePick(n: number) {
      if (this.isAnimating) return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      const isCorrect = n === this.target
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `frog-${this.start}-${this.add}`, isCorrect)
      if (!isCorrect) {
        this.scene?.wrongPad(n)
        shell.submit(false)
        return
      }
      this.isAnimating = true
      await this.scene?.hopTo(this.target)
      this.scene?.cheer()
      shell.submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
.frog {
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
