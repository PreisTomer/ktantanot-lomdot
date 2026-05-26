<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="app">
    <AnimatedBackground />
    <main class="app__stage">
      <router-view v-slot="{ Component }">
        <transition name="screen" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Opening tap: satisfies the browser's gesture requirement so the very
         first spoken prompt is heard (autoplay is blocked before a gesture). -->
    <button v-if="!started" class="app__gate" type="button" :aria-label="$t('common.start')" @click="start">
      <span class="app__gate-orb app__gate-orb--a"></span>
      <span class="app__gate-orb app__gate-orb--b"></span>
      <span class="app__gate-orb app__gate-orb--c"></span>
      <span class="app__gate-spark app__gate-spark--1"></span>
      <span class="app__gate-spark app__gate-spark--2"></span>
      <span class="app__gate-spark app__gate-spark--3"></span>
      <span class="app__gate-spark app__gate-spark--4"></span>

      <div class="app__gate-hero">
        <div class="app__gate-worlds">
          <span class="app__gate-world app__gate-world--reading">{{ icon.BOOK }}</span>
          <span class="app__gate-world app__gate-world--math">{{ icon.BEAR }}</span>
          <span class="app__gate-world app__gate-world--memory">{{ icon.BELL }}</span>
          <span class="app__gate-world app__gate-world--sisters">{{ icon.SISTERS }}</span>
        </div>
        <h1 class="app__gate-title">{{ $t('common.appName') }}</h1>
        <span class="app__gate-play">
          <span class="app__gate-play-ring"></span>
          <span class="app__gate-play-ring app__gate-play-ring--2"></span>
          <span class="app__gate-play-disc"><span class="app__gate-play-tri"></span></span>
        </span>
        <span class="app__gate-cta">{{ $t('common.start') }}</span>
      </div>
    </button>
    <LanguageToggle v-if="!started" class="app__gate-lang" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import AnimatedBackground from '@/components/AnimatedBackground.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'App',
  components: { AnimatedBackground, LanguageToggle },
  data() {
    return {
      started: false
    }
  },
  computed: {
    icon() {
      return ICON
    }
  },
  methods: {
    start() {
      this.started = true
      // The first screen's prompt was requested on load but blocked; replay it
      // now that this tap has unlocked audio.
      audio.replayLast()
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.app {
  position: relative;
  min-block-size: 100%;

  &__stage {
    @include flex-center;
    min-block-size: 100vh;
    padding: var(--sp-lg);
  }

  &__gate {
    @include flex-column-center;
    position: fixed;
    inset: 0;
    z-index: 20;
    overflow: hidden;
    inline-size: 100%;
    block-size: 100%;
    border: none;
    color: var(--color-ink);
    // Soft dawn aurora of the four world colours over warm cream.
    background:
      radial-gradient(80% 55% at 16% 14%, color-mix(in srgb, var(--color-coral) 26%, transparent), transparent 62%),
      radial-gradient(80% 55% at 84% 16%, color-mix(in srgb, var(--color-sky) 30%, transparent), transparent 62%),
      radial-gradient(90% 60% at 50% 118%, color-mix(in srgb, var(--color-leaf) 30%, transparent), transparent 60%),
      radial-gradient(120% 80% at 50% 26%, color-mix(in srgb, var(--color-sun) 46%, var(--color-bg)) 0%, var(--color-bg) 74%);

    // Language toggle floats above the gate (sibling element, higher z so it is
    // tappable without triggering the full-screen start button).
    &-lang {
      position: fixed;
      inset-block-start: var(--sp-md);
      inset-inline-end: var(--sp-md);
      z-index: 21;
    }

    &-orb {
      position: absolute;
      border-radius: var(--radius-pill);
      filter: blur(6px);
      opacity: var(--op-ghost);
      pointer-events: none;

      &--a {
        inline-size: 300px;
        block-size: 300px;
        inset-block-start: -70px;
        inset-inline-end: -50px;
        background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-sky) 70%, white), var(--color-sky));
        @include ambient(float, 9s);
      }

      &--b {
        inline-size: 220px;
        block-size: 220px;
        inset-block-end: -40px;
        inset-inline-start: -40px;
        background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-coral) 70%, white), var(--color-coral));
        @include ambient(drift, 12s);
      }

      &--c {
        inline-size: 160px;
        block-size: 160px;
        inset-block-start: 22%;
        inset-inline-start: 12%;
        background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-grape) 70%, white), var(--color-grape));
        @include ambient(float, 11s);
      }
    }

    &-spark {
      position: absolute;
      inline-size: 22px;
      block-size: 22px;
      background: radial-gradient(circle at 50% 50%, var(--color-white), var(--color-sun) 70%);
      clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
      opacity: var(--op-muted);
      pointer-events: none;

      &--1 { inset-block-start: 20%; inset-inline-start: 26%; @include ambient(twinkle, 4s); }
      &--2 { inset-block-start: 28%; inset-inline-end: 24%; inline-size: 28px; block-size: 28px; @include ambient(twinkle, 5s); }
      &--3 { inset-block-end: 26%; inset-inline-start: 20%; inline-size: 16px; block-size: 16px; @include ambient(twinkle, 6s); }
      &--4 { inset-block-end: 32%; inset-inline-end: 28%; @include ambient(twinkle, 5.5s); }
    }

    &-hero {
      @include flex-column-center;
      position: relative;
      gap: var(--sp-lg);
      padding: var(--sp-lg);
      text-align: center;
    }

    &-worlds {
      display: flex;
      gap: var(--sp-md);
    }

    &-world {
      @include flex-center;
      inline-size: clamp(56px, 9vw, 78px);
      block-size: clamp(56px, 9vw, 78px);
      font-size: clamp(1.9rem, 4.4vw, 2.7rem);
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-card);

      &--reading {
        background: linear-gradient(160deg, color-mix(in srgb, var(--color-coral) 55%, white), var(--color-coral));
        @include ambient(float, 4.4s);
      }

      &--math {
        background: linear-gradient(160deg, color-mix(in srgb, var(--color-leaf) 55%, white), var(--color-leaf));
        @include ambient(float, 5s);
        animation-delay: -0.6s;
      }

      &--memory {
        background: linear-gradient(160deg, color-mix(in srgb, var(--color-grape) 55%, white), var(--color-grape));
        @include ambient(float, 4.7s);
        animation-delay: -1.2s;
      }

      &--sisters {
        background: linear-gradient(160deg, color-mix(in srgb, var(--color-sky) 55%, white), var(--color-sky));
        @include ambient(float, 5.3s);
        animation-delay: -1.8s;
      }
    }

    &-title {
      margin: 0;
      font-size: clamp(2.4rem, 8vw, var(--fs-hero));
      font-weight: 700;
      line-height: 1.05;
      background: linear-gradient(100deg, var(--color-coral-deep), var(--color-primary-deep) 52%, var(--color-grape-deep));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 3px 2px color-mix(in srgb, var(--color-ink) 18%, transparent));
      @include spring-in(bounce-in, 0.6s);
    }

    &-play {
      @include flex-center;
      position: relative;
      inline-size: clamp(112px, 22vw, 150px);
      block-size: clamp(112px, 22vw, 150px);
      @include ambient(float, 2.6s);

      &-ring {
        position: absolute;
        inset: 0;
        border-radius: var(--radius-pill);
        background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 42%, transparent) 0%, transparent 70%);
        pointer-events: none;
        @include ambient(glow-pulse, 2.4s);

        &--2 {
          animation-delay: -1.2s;
        }
      }

      &-disc {
        @include flex-center;
        position: relative;
        inline-size: clamp(88px, 17vw, 116px);
        block-size: clamp(88px, 17vw, 116px);
        border-radius: var(--radius-pill);
        background: linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 82%, white), var(--color-primary-deep));
        box-shadow: var(--shadow-float), 0 0 30px color-mix(in srgb, var(--color-primary) 55%, transparent);

        &::before {
          content: '';
          position: absolute;
          inset-block-start: 8%;
          inset-inline: 14%;
          block-size: 38%;
          border-radius: var(--radius-pill);
          background: linear-gradient(to bottom, color-mix(in srgb, white 60%, transparent), transparent);
          pointer-events: none;
        }
      }

      // Media "play" glyph: always points right (physical border, not logical),
      // matching the universal play symbol regardless of RTL.
      &-tri {
        inline-size: 0;
        block-size: 0;
        margin-left: 14%;
        border-top: clamp(20px, 4vw, 28px) solid transparent;
        border-bottom: clamp(20px, 4vw, 28px) solid transparent;
        border-left: clamp(34px, 6.5vw, 46px) solid var(--color-white);
      }
    }

    &-cta {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--color-ink-soft);
      @include ambient(pulse, 2s);
    }
  }
}

.screen-enter-active,
.screen-leave-active {
  transition: opacity var(--tr-normal), transform var(--tr-normal);
}

.screen-enter-from,
.screen-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
