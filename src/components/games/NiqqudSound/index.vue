<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.niqqudSound.title')"
    :prompt="$t('games.niqqudSound.instruction')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="niqqud">
        <button
          class="niqqud__replay"
          type="button"
          :aria-label="$t('common.repeat')"
          @click="replayPrompt"
        >
          <span class="niqqud__replay-icon">{{ icon.SPEAKER }}</span>
        </button>
        <div ref="tilesEl" class="niqqud__tiles">
          <button
            v-for="(form, index) in tileForms"
            :key="form.id"
            class="niqqud__tile"
            :class="{
              'niqqud__tile--correct': revealedCorrect === form.id,
              'niqqud__tile--wrong': lastWrong === form.id
            }"
            :style="{ '--tile-tone': tileTones[index % tileTones.length] }"
            type="button"
            :disabled="isBusy || busy"
            @click="tapForm(form, submit)"
          >
            <span class="niqqud__glyph" lang="he">{{ form.display }}</span>
          </button>
        </div>
      </div>
    </template>
  </GameShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import gsap from 'gsap'

import { useProgressStore } from '@/stores/progressStore'

import { audio } from '@/services/audio'

import GameShell from '@/components/GameShell.vue'

import { shuffle } from '@/utils/shuffle'
import { pickNextItem } from '@/utils/spacedRepetition'
import { createRng } from '@/utils/rng'
import type { Rng } from '@/utils/rng'

import { ROUNDS_PER_SESSION, WRONG_FEEDBACK_MS } from '@/constants/gameConfig'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'
import { ICON } from '@/constants/icons'

import { composeNiqqudPrompt, NIQQUD_LETTERS, VOWEL_IDS } from './data'
import type { NiqqudLetter, VowelId, VowelForm } from './data'

type SubmitFn = (isCorrect: boolean) => void

interface TileForm {
  id: string
  vowel: VowelId
  display: string
  spoken: string
}

const ITEM_IDS: string[] = NIQQUD_LETTERS.flatMap((entry) =>
  VOWEL_IDS.map((vowel) => `${entry.base}:${vowel}`)
)

function letterOf(itemId: string): NiqqudLetter {
  const base = itemId.split(':')[0]
  return NIQQUD_LETTERS.find((entry) => entry.base === base) ?? NIQQUD_LETTERS[0]
}

function vowelOf(itemId: string): VowelId {
  return itemId.split(':')[1] as VowelId
}

export default defineComponent({
  name: 'NiqqudSoundGame',
  components: { GameShell },
  data() {
    return {
      itemId: ITEM_IDS[0],
      tileForms: [] as TileForm[],
      recent: [] as string[],
      busy: false,
      lastWrong: '' as string,
      revealedCorrect: '' as string,
      wrongTimer: null as ReturnType<typeof setTimeout> | null,
      reduceMotion: false,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    icon() {
      return ICON
    },
    rounds(): number {
      return ROUNDS_PER_SESSION
    },
    letter(): NiqqudLetter {
      return letterOf(this.itemId)
    },
    targetVowel(): VowelId {
      return vowelOf(this.itemId)
    },
    targetForm(): VowelForm {
      return this.letter.forms[this.targetVowel]
    },
    speechParts(): string[] {
      // One element so audio service plays a single clip — chaining multiple
      // clips would insert audible silence padding at every boundary.
      return [composeNiqqudPrompt(this.$t('games.niqqudSound.find'), this.targetForm.spoken)]
    },
    tileTones(): string[] {
      return ['var(--color-coral)', 'var(--color-sky)', 'var(--color-sun)']
    }
  },
  created() {
    this.pickRound()
  },
  mounted() {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.$nextTick(() => this.revealTiles())
  },
  beforeUnmount() {
    if (this.wrongTimer) clearTimeout(this.wrongTimer)
  },
  methods: {
    pickRound() {
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      const next = pickNextItem(ITEM_IDS, stats, this.rng, this.recent)
      this.recent.push(next)
      const cap = Math.max(0, ITEM_IDS.length - 4)
      if (this.recent.length > cap) this.recent.shift()
      this.itemId = next

      const target = this.targetForm
      const distractorVowels = shuffle(
        VOWEL_IDS.filter((vowel) => vowel !== this.targetVowel),
        this.rng
      ).slice(0, 2)
      const tiles: TileForm[] = [
        { id: this.targetVowel, vowel: this.targetVowel, display: target.display, spoken: target.spoken },
        ...distractorVowels.map((vowel) => ({
          id: vowel,
          vowel,
          display: this.letter.forms[vowel].display,
          spoken: this.letter.forms[vowel].spoken
        }))
      ]
      this.tileForms = shuffle(tiles, this.rng)
      this.busy = false
      this.lastWrong = ''
      this.revealedCorrect = ''
    },
    nextRound() {
      this.pickRound()
      this.$nextTick(() => this.revealTiles())
    },
    replayPrompt() {
      if (this.busy) return
      // Replay says only the target syllable, not the full prompt — the child
      // already heard the framing once and just needs the sound again.
      audio.speak(this.targetForm.spoken)
    },
    tapForm(form: TileForm, submit: SubmitFn) {
      if (this.busy) return
      const isCorrect = form.vowel === this.targetVowel
      this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.itemId, isCorrect)
      if (!isCorrect) {
        this.lastWrong = form.id
        this.shakeTile(form.id)
        submit(false)
        this.wrongTimer = setTimeout(() => {
          this.lastWrong = ''
        }, WRONG_FEEDBACK_MS)
        return
      }
      this.busy = true
      this.revealedCorrect = form.id
      this.popTile(form.id)
      submit(true)
    },
    revealTiles() {
      if (this.reduceMotion) return
      const wrap = this.$refs.tilesEl as HTMLElement | undefined
      if (!wrap) return
      gsap.from(wrap.children, {
        y: 24,
        opacity: 0,
        scale: 0.7,
        stagger: 0.08,
        duration: 0.4,
        ease: 'back.out(1.8)',
        clearProps: 'all'
      })
    },
    shakeTile(id: string) {
      if (this.reduceMotion) return
      const wrap = this.$refs.tilesEl as HTMLElement | undefined
      const el = wrap?.querySelector(`[data-tile="${id}"]`) as HTMLElement | null
      const target = el ?? (wrap?.children[this.indexOf(id)] as HTMLElement | undefined)
      if (!target) return
      gsap.fromTo(
        target,
        { x: -8 },
        { x: 8, duration: 0.07, yoyo: true, repeat: 3, ease: 'sine.inOut', clearProps: 'x' }
      )
    },
    popTile(id: string) {
      if (this.reduceMotion) return
      const wrap = this.$refs.tilesEl as HTMLElement | undefined
      const target = wrap?.children[this.indexOf(id)] as HTMLElement | undefined
      if (!target) return
      gsap.fromTo(
        target,
        { scale: 1 },
        { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'back.out(2)', clearProps: 'transform' }
      )
    },
    indexOf(id: string): number {
      return this.tileForms.findIndex((form) => form.id === id)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.niqqud {
  @include flex-column-center;
  inline-size: 100%;
  gap: var(--sp-lg);

  &__replay {
    @include flex-center;
    @include pressable;
    inline-size: var(--touch-min);
    block-size: var(--touch-min);
    color: var(--color-ink);
    background: var(--color-surface);
    border-radius: 50%;
    box-shadow: var(--shadow-soft);
  }

  &__replay-icon {
    font-size: var(--fs-lg);
    @include ambient(pulse, 3s);
  }

  &__tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-lg);
    inline-size: 100%;
    max-inline-size: 48rem;

    @media (max-width: 600px) {
      gap: var(--sp-md);
    }
  }

  &__tile {
    @include flex-center;
    @include dimensional-tile;
    aspect-ratio: 1 / 1;
    min-block-size: 9rem;
    padding: var(--sp-md);
    background: var(--tile-tone, var(--color-sun));
    color: var(--color-white);
    transition: transform var(--tr-fast), box-shadow var(--tr-fast), filter var(--tr-normal);

    &--correct {
      filter: brightness(1.08) saturate(1.15);
      box-shadow:
        var(--shadow-card),
        0 0 32px color-mix(in srgb, var(--color-sun) 80%, transparent);
    }

    &--wrong {
      filter: saturate(0.6);
    }

    &:disabled {
      cursor: default;
    }
  }

  &__glyph {
    font-size: clamp(4rem, 14vw, 7rem);
    font-weight: 700;
    line-height: 1;
    // The niqqud-bearing letter must look the same as in the reading view;
    // keep it on a strong contrast background for the small marks to read.
    text-shadow: 0 3px 10px color-mix(in srgb, var(--color-ink) 35%, transparent);
  }
}
</style>
