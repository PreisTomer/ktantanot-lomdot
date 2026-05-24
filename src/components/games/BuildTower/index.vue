<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.buildTower.title')"
    :prompt="$t('games.buildTower.prompt')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="tower">
      <canvas ref="stage" class="tower__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { generateTowerRound } from '@/utils/towerOrder'
import type { TowerRound } from '@/utils/towerOrder'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { TOWER_BLOCKS, TOWER_MAX, TOWER_ROUNDS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { TowerScene } from './towerScene'

export default defineComponent({
  name: 'BuildTowerGame',
  components: { GameShell },
  data() {
    return {
      round: { blocks: [], order: [] } as TowerRound,
      placedCount: 0,
      isAnimating: false,
      lastSignature: '',
      scene: null as TowerScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return TOWER_ROUNDS
    },
    speechParts(): string[] {
      return [this.$t('games.buildTower.instruction')]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    // markRaw is essential: without it Vue makes the whole Pixi object tree
    // reactive, and GSAP tweening the proxies corrupts Pixi and crashes.
    const scene = markRaw(new TowerScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.round.blocks, this.handlePick)
    this.scene = scene
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      let next = generateTowerRound(TOWER_MAX, TOWER_BLOCKS, this.rng)
      let guard = 0
      while (next.order.join('-') === this.lastSignature && guard < 10) {
        next = generateTowerRound(TOWER_MAX, TOWER_BLOCKS, this.rng)
        guard++
      }
      this.round = next
      this.lastSignature = next.order.join('-')
      this.placedCount = 0
    },
    nextRound() {
      this.isAnimating = false
      this.pickRound()
      this.scene?.setRound(this.round.blocks, this.handlePick)
    },
    async handlePick(value: number) {
      if (this.isAnimating) return
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      const expected = this.round.order[this.placedCount]
      const isCorrect = value === expected
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `tower-${this.round.order.length}`, isCorrect)
      if (!isCorrect) {
        this.scene?.wrong(value)
        shell.submit(false)
        return
      }
      this.isAnimating = true
      await this.scene?.placeBlock(value)
      this.placedCount += 1
      if (this.placedCount >= this.round.order.length) {
        this.scene?.celebrate()
        shell.submit(true)
        return
      }
      this.isAnimating = false
    }
  }
})
</script>

<style lang="scss" scoped>
.tower {
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 520;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
