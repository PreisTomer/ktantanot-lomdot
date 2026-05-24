<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.whatInRoom.title')"
    :prompt="currentPrompt"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="room">
        <canvas ref="stage" class="room__stage"></canvas>
        <div v-show="isRecall" class="room__options">
          <OptionTile
            v-for="(option, i) in round.options"
            :key="option.key"
            :label="option.emoji"
            :tone="tones[i % tones.length]"
            :shake="option.key === wrongKey"
            :disabled="isBusy"
            @pick="() => handlePick(option, submit)"
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

import { generateRoomRound } from '@/utils/roomMemory'
import type { RoomRound } from '@/utils/roomMemory'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { TILE_TONES } from '@/theme/colors'

import { ROOM_OPTIONS, ROOM_ROUNDS, ROOM_SHOWN, ROOM_STUDY_MS, WRONG_FEEDBACK_MS } from '@/constants/gameConfig'
import { ROOM_ITEMS } from '@/constants/memoryItems'
import type { RoomItem } from '@/constants/memoryItems'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'

import { RoomScene } from './roomScene'

type SubmitFn = (isCorrect: boolean) => void
type Phase = 'study' | 'hide' | 'recall'

export default defineComponent({
  name: 'WhatInRoomGame',
  components: { GameShell, OptionTile },
  data() {
    return {
      phase: 'study' as Phase,
      round: generateRoomRound(ROOM_ITEMS, ROOM_SHOWN, ROOM_OPTIONS, createRng(Date.now())) as RoomRound,
      wrongKey: null as string | null,
      lastMissing: '',
      scene: null as RoomScene | null,
      studyTimer: null as ReturnType<typeof setTimeout> | null,
      wrongTimer: null as ReturnType<typeof setTimeout> | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return ROOM_ROUNDS
    },
    isRecall(): boolean {
      return this.phase === 'recall'
    },
    tones(): readonly string[] {
      return TILE_TONES
    },
    currentPrompt(): string {
      return this.isRecall ? this.$t('games.whatInRoom.recall') : this.$t('games.whatInRoom.study')
    },
    speechParts(): string[] {
      return [this.currentPrompt]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    // markRaw is essential: without it Vue makes the whole Pixi object tree
    // reactive, and GSAP tweening the proxies corrupts Pixi and crashes.
    const scene = markRaw(new RoomScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    scene.setRound(this.round.shown)
    this.scene = scene
    this.startStudy()
  },
  beforeUnmount() {
    if (this.studyTimer) clearTimeout(this.studyTimer)
    if (this.wrongTimer) clearTimeout(this.wrongTimer)
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      let next = generateRoomRound(ROOM_ITEMS, ROOM_SHOWN, ROOM_OPTIONS, this.rng)
      let guard = 0
      while (next.missing.key === this.lastMissing && guard < 10) {
        next = generateRoomRound(ROOM_ITEMS, ROOM_SHOWN, ROOM_OPTIONS, this.rng)
        guard++
      }
      this.round = next
      this.lastMissing = next.missing.key
      this.wrongKey = null
      this.phase = 'study'
    },
    startStudy() {
      if (this.studyTimer) clearTimeout(this.studyTimer)
      this.studyTimer = setTimeout(() => this.beginConceal(), ROOM_STUDY_MS)
    },
    async beginConceal() {
      this.phase = 'hide'
      await this.scene?.conceal(this.round.missing.key)
      this.phase = 'recall'
    },
    nextRound() {
      this.pickRound()
      this.scene?.setRound(this.round.shown)
      this.startStudy()
    },
    handlePick(option: RoomItem, submit: SubmitFn) {
      if (this.phase !== 'recall') return
      const isCorrect = option.key === this.round.missing.key
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, `room-${this.round.missing.key}`, isCorrect)
      if (!isCorrect) {
        this.wrongKey = option.key
        this.wrongTimer = setTimeout(() => {
          this.wrongKey = null
        }, WRONG_FEEDBACK_MS)
        submit(false)
        return
      }
      this.scene?.reveal(this.round.missing.key)
      submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.room {
  @include flex-column-center;
  gap: var(--sp-lg);
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 540;
    display: block;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-md);
    inline-size: 100%;
    max-inline-size: 28rem;
  }
}
</style>
