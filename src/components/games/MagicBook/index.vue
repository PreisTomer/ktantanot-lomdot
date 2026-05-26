<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <GameShell
    :title="$t('games.magicBook.title')"
    :prompt="$t('games.magicBook.instruction')"
    :speech-parts="speechParts"
    :rounds="rounds"
    @next="nextRound"
  >
    <template #default="{ submit, isBusy }">
      <div class="magic">
        <div class="magic__book">
          <span class="magic__twinkle magic__twinkle--1"></span>
          <span class="magic__twinkle magic__twinkle--2"></span>
          <span class="magic__twinkle magic__twinkle--3"></span>
          <div ref="scene" class="magic__scene">
            <span
              v-for="word in discoveredWords"
              :key="word.text"
              class="magic__actor"
              :data-word="word.text"
              >{{ word.picture }}</span
            >
            <span v-if="isSceneEmpty" class="magic__hint">{{ icon.BOOK }}</span>
          </div>
          <div ref="sentence" class="magic__sentence">
            <button
              v-for="word in displayWords"
              :key="word.text"
              class="magic__word"
              :class="{ 'magic__word--awake': isAwake(word) }"
              :data-word="word.text"
              type="button"
              :disabled="isBusy || busy"
              @click="tapWord(word, submit)"
            >
              {{ word.text }}
            </button>
          </div>
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

import { MAGIC_ADVANCE_MS, MAGIC_COMPLETE_MS, MAGIC_ROUNDS } from '@/constants/gameConfig'
import { MAGIC_STORIES } from '@/constants/stories'
import type { StoryPage, StoryWord } from '@/constants/stories'
import { DEFAULT_PROFILE_ID } from '@/constants/strings'
import type { Locale } from '@/constants/strings'
import { ICON } from '@/constants/icons'

type SubmitFn = (isCorrect: boolean) => void

export default defineComponent({
  name: 'MagicBookGame',
  components: { GameShell },
  data() {
    return {
      page: { id: '', words: [] } as StoryPage,
      order: [] as number[],
      targetIndex: 0,
      found: [] as string[],
      busy: false,
      recent: [] as string[],
      completed: false,
      reduceMotion: false,
      completeTimer: null as ReturnType<typeof setTimeout> | null,
      advanceTimer: null as ReturnType<typeof setTimeout> | null,
      rng: createRng(Date.now()) as Rng
    }
  },
  computed: {
    ...mapStores(useProgressStore),
    icon() {
      return ICON
    },
    rounds(): number {
      return MAGIC_ROUNDS
    },
    locale(): Locale {
      return this.$i18n.locale as Locale
    },
    stories(): StoryPage[] {
      return MAGIC_STORIES[this.locale]
    },
    storyIds(): string[] {
      return this.stories.map((story) => story.id)
    },
    target(): StoryWord {
      return this.page.words[Math.min(this.targetIndex, this.page.words.length - 1)]
    },
    displayWords(): StoryWord[] {
      return this.order.map((index) => this.page.words[index])
    },
    speechParts(): string[] {
      return [this.$t('games.magicBook.find'), this.target.text]
    },
    discoveredWords(): StoryWord[] {
      return this.page.words.filter((word) => this.found.includes(word.text))
    },
    isSceneEmpty(): boolean {
      return this.found.length === 0
    }
  },
  created() {
    this.pickPage()
  },
  mounted() {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.$nextTick(() => this.revealPage())
  },
  beforeUnmount() {
    if (this.completeTimer) clearTimeout(this.completeTimer)
    if (this.advanceTimer) clearTimeout(this.advanceTimer)
  },
  methods: {
    pickPage() {
      const stats = this.progressStore.byProfile[DEFAULT_PROFILE_ID]?.items ?? {}
      const id = pickNextItem(this.storyIds, stats, this.rng, this.recent)
      this.recent.push(id)
      if (this.recent.length > this.storyIds.length - 1) this.recent.shift()
      this.page = this.stories.find((story) => story.id === id) ?? this.stories[0]
      this.order = this.scrambleOrder(this.page.words.length)
      this.targetIndex = 0
      this.found = []
      this.busy = false
      this.completed = false
    },
    scrambleOrder(length: number): number[] {
      const indices = Array.from({ length }, (_, i) => i)
      let order = shuffle(indices, this.rng)
      while (length > 1 && order.every((value, i) => value === i)) {
        order = shuffle(indices, this.rng)
      }
      return order
    },
    nextRound() {
      this.pickPage()
      this.$nextTick(() => this.revealPage())
    },
    isAwake(word: StoryWord): boolean {
      return this.found.includes(word.text)
    },
    tapWord(word: StoryWord, submit: SubmitFn) {
      if (this.busy || this.completed) return
      if (word.text !== this.target.text) {
        this.nudgeWord(word.text)
        submit(false)
        return
      }
      this.busy = true
      this.found.push(word.text)
      audio.speak(word.text)
      this.$nextTick(() => this.animateActor(word))
      const isLast = this.targetIndex >= this.page.words.length - 1
      if (isLast) {
        this.completed = true
        this.progressStore.recordAnswer(DEFAULT_PROFILE_ID, this.page.id, true)
        this.completeTimer = setTimeout(() => submit(true), MAGIC_COMPLETE_MS)
        return
      }
      this.advanceTimer = setTimeout(() => {
        this.targetIndex += 1
        this.busy = false
      }, MAGIC_ADVANCE_MS)
    },
    nudgeWord(text: string) {
      if (this.reduceMotion) return
      const sentence = this.$refs.sentence as HTMLElement | undefined
      const el = sentence?.querySelector(`[data-word="${text}"]`) as HTMLElement | null
      if (!el) return
      gsap.fromTo(
        el,
        { x: -6 },
        { x: 6, duration: 0.07, yoyo: true, repeat: 3, ease: 'sine.inOut', clearProps: 'x' }
      )
    },
    revealPage() {
      if (this.reduceMotion) return
      const sentence = this.$refs.sentence as HTMLElement | undefined
      if (!sentence) return
      gsap.from(sentence.children, {
        y: 24,
        opacity: 0,
        scale: 0.8,
        stagger: 0.08,
        duration: 0.4,
        ease: 'back.out(1.6)',
        clearProps: 'all'
      })
    },
    animateActor(word: StoryWord) {
      if (this.reduceMotion) return
      const scene = this.$refs.scene as HTMLElement | undefined
      const el = scene?.querySelector(`[data-word="${word.text}"]`) as HTMLElement | null
      if (!el) return
      gsap.killTweensOf(el)
      const tl = gsap.timeline({ onComplete: () => gsap.set(el, { clearProps: 'transform' }) })
      tl.fromTo(el, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
      switch (word.action) {
        case 'hop':
          tl.to(el, { y: -22, duration: 0.2, yoyo: true, repeat: 3, ease: 'power1.out' })
          break
        case 'run':
          tl.to(el, { x: 18, duration: 0.12, yoyo: true, repeat: 5, ease: 'none' })
          break
        case 'fly':
          tl.to(el, { y: -26, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' })
          break
        case 'rise':
          tl.to(el, { y: -24, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.inOut' })
          break
        case 'grow':
          tl.to(el, { scale: 1.4, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' })
          break
        case 'spin':
          tl.to(el, { rotation: 360, duration: 0.6, ease: 'power1.inOut' })
          break
        case 'wiggle':
          tl.to(el, { rotation: 14, duration: 0.1, yoyo: true, repeat: 5, ease: 'sine.inOut' })
          break
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.magic {
  @include flex-column-center;
  inline-size: 100%;

  &__book {
    position: relative;
    inline-size: 100%;
    max-inline-size: 48rem;
    padding: var(--sp-lg) var(--sp-xl);
    // Warm parchment pages with a soft sheen at the top edge.
    background:
      radial-gradient(130% 70% at 50% -8%, color-mix(in srgb, white 65%, transparent), transparent 70%),
      linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
    // Gilded grape cover with a gold inner rim.
    border: 6px solid color-mix(in srgb, var(--color-grape) 62%, white);
    border-radius: var(--radius-lg);
    // Page-stack thickness on the outer edges, a float lift, a magical grape
    // aura, and a thin gold rim hugging the pages.
    box-shadow:
      6px 0 0 color-mix(in srgb, var(--color-bg-2) 85%, white),
      -6px 0 0 color-mix(in srgb, var(--color-bg-2) 85%, white),
      var(--shadow-float),
      0 0 54px color-mix(in srgb, var(--color-grape) 42%, transparent),
      inset 0 0 0 2px color-mix(in srgb, var(--color-sun) 55%, transparent);

    // Ribbon bookmark peeking over the top edge.
    &::before {
      content: '';
      position: absolute;
      inset-block-start: -6px;
      inset-inline-end: 12%;
      inline-size: 26px;
      block-size: 54px;
      background: linear-gradient(180deg, var(--color-coral), var(--color-coral-deep));
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%);
      box-shadow: var(--shadow-soft);
      pointer-events: none;
    }
  }

  &__twinkle {
    position: absolute;
    inline-size: 18px;
    block-size: 18px;
    background: radial-gradient(circle at 50% 50%, var(--color-white), var(--color-sun) 70%);
    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
    opacity: var(--op-muted);
    pointer-events: none;
    z-index: 1;

    &--1 {
      inset-block-start: 9%;
      inset-inline-start: 7%;
      @include ambient(twinkle, 4s);
    }

    &--2 {
      inset-block-start: 14%;
      inset-inline-end: 9%;
      @include ambient(twinkle, 5s);
    }

    &--3 {
      inset-block-end: 30%;
      inset-inline-start: 10%;
      @include ambient(twinkle, 6s);
    }
  }

  &__scene {
    @include flex-center;
    position: relative;
    flex-wrap: wrap;
    gap: var(--sp-md);
    min-block-size: 11rem;
    margin-block-end: var(--sp-md);
    padding: var(--sp-md);
    // Framed illustration window inset into the page.
    background: radial-gradient(120% 100% at 50% 28%, color-mix(in srgb, white 58%, transparent), transparent 76%);
    border-radius: var(--radius);
    box-shadow: inset 0 2px 12px color-mix(in srgb, var(--color-ink) 10%, transparent);
  }

  &__actor {
    font-size: var(--fs-display);
    line-height: 1;
    filter: drop-shadow(0 8px 8px color-mix(in srgb, var(--color-ink) 26%, transparent));
  }

  &__hint {
    font-size: var(--fs-hero);
    line-height: 1;
    opacity: var(--op-muted);
    filter: drop-shadow(0 0 18px color-mix(in srgb, var(--color-grape) 60%, transparent));
    @include ambient(float, 5s);
  }

  &__sentence {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--sp-md);
    padding-block-start: var(--sp-md);
    // Ruled writing line across the page.
    border-block-start: 3px solid color-mix(in srgb, var(--color-grape) 22%, transparent);
  }

  &__word {
    @include flex-center;
    min-block-size: var(--touch-min);
    padding: var(--sp-sm) var(--sp-lg);
    font-size: var(--fs-lg);
    font-weight: 700;
    color: var(--color-ink);
    // Raised parchment word-card with a warm grape edge.
    background: linear-gradient(180deg, var(--color-white), var(--color-bg));
    border: 2px solid color-mix(in srgb, var(--color-grape) 35%, white);
    border-radius: var(--radius);
    box-shadow: 0 5px 0 color-mix(in srgb, var(--color-grape) 30%, white), var(--shadow-soft);
    transition: transform var(--tr-fast), box-shadow var(--tr-fast), background var(--tr-normal),
      border-color var(--tr-normal);

    &:active {
      transform: translateY(5px);
      box-shadow: 0 0 0 color-mix(in srgb, var(--color-grape) 30%, white), var(--shadow-press);
    }

    // Found: the word lights up gold and glows.
    &--awake {
      background: linear-gradient(180deg, color-mix(in srgb, var(--color-sun) 70%, white), var(--color-sun));
      border-color: color-mix(in srgb, var(--color-primary-deep) 55%, var(--color-sun));
      box-shadow:
        0 5px 0 color-mix(in srgb, var(--color-primary-deep) 40%, white),
        0 0 24px color-mix(in srgb, var(--color-sun) 70%, transparent);
    }

    &:disabled {
      cursor: default;
    }
  }
}
</style>
