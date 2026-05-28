<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    ref="shell"
    :title="$t('games.soundDetective.title')"
    :prompt="$t('games.soundDetective.prompt', { letter: letterName })"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <div class="detective">
      <canvas ref="stage" class="detective__stage"></canvas>
    </div>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { mapStores } from 'pinia'

import { useProgressStore } from '@/stores/progressStore'

import GameShell from '@/components/GameShell.vue'

import { availableInitials, buildSoundOptions } from '@/utils/initialSound'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { DETECTIVE_OPTIONS, DETECTIVE_ROUNDS } from '@/constants/gameConfig'
import { DETECTIVE_WORDS } from '@/constants/words'
import type { PictureWord } from '@/constants/words'
import { composeLetterPrompt, LETTER_NAMES } from '@/constants/letters'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'
import type { Locale } from '@/constants/strings'

import { DetectiveScene } from './detectiveScene'

export default defineComponent({
  name: 'DetectiveGame',
  components: { GameShell },
  data() {
    return {
      target: '',
      options: [] as PictureWord[],
      recent: [] as string[],
      scene: null as DetectiveScene | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    rounds(): number {
      return DETECTIVE_ROUNDS
    },
    locale(): Locale {
      return this.$i18n.locale as Locale
    },
    words(): PictureWord[] {
      return DETECTIVE_WORDS[this.locale]
    },
    initials(): string[] {
      return availableInitials(this.words, DETECTIVE_OPTIONS)
    },
    letterName(): string {
      return LETTER_NAMES[this.locale][this.target] ?? this.target
    },
    speechParts(): string[] {
      // One element so audio service plays a single clip — chaining the
      // instruction phrase + the bare letter name was inserting silence at the
      // boundary and making names like לָמֶד sound choppy ("la-med") in isolation.
      return [composeLetterPrompt(this.$t('games.soundDetective.instruction'), this.letterName)]
    }
  },
  created() {
    this.pickRound()
  },
  async mounted() {
    const scene = markRaw(new DetectiveScene())
    await scene.init(this.$refs.stage as HTMLCanvasElement)
    this.scene = scene
    await scene.intro()
    scene.setRound(this.target, this.options, this.handlePick)
  },
  beforeUnmount() {
    this.scene?.destroy()
  },
  methods: {
    pickRound() {
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      this.target = pickNextItem(this.initials, stats, this.rng, this.recent)
      this.recent.push(this.target)
      if (this.recent.length > this.initials.length - 1) this.recent.shift()
      this.options = buildSoundOptions(this.words, this.target, DETECTIVE_OPTIONS, this.rng)
    },
    nextRound() {
      this.pickRound()
      this.scene?.setRound(this.target, this.options, this.handlePick)
    },
    async handlePick(word: string) {
      const shell = this.$refs.shell as InstanceType<typeof GameShell> | undefined
      if (!shell) return
      const isCorrect = word[0] === this.target
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.target, isCorrect)
      if (!isCorrect) {
        this.scene?.wrong(word)
        shell.submit(false)
        return
      }
      await this.scene?.correct(word)
      shell.submit(true)
    }
  }
})
</script>

<style lang="scss" scoped>
.detective {
  inline-size: 100%;

  &__stage {
    inline-size: 100%;
    max-inline-size: 52rem;
    block-size: auto;
    aspect-ratio: 900 / 560;
    display: block;
    margin-inline: auto;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
  }
}
</style>
