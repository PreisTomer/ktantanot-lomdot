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
      <span class="app__gate-title">{{ $t('common.appName') }}</span>
      <span class="app__gate-play">{{ icon.PLAY }}</span>
      <span class="app__gate-cta">{{ $t('common.start') }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import AnimatedBackground from '@/components/AnimatedBackground.vue'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'App',
  components: { AnimatedBackground },
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
    gap: var(--sp-md);
    position: fixed;
    inset: 0;
    z-index: 20;
    inline-size: 100%;
    block-size: 100%;
    border: none;
    color: var(--color-ink);
    background:
      radial-gradient(120% 80% at 50% 30%, color-mix(in srgb, var(--color-sun) 55%, var(--color-bg)) 0%, var(--color-bg) 70%);

    &-title {
      font-size: var(--fs-2xl);
      font-weight: 700;
    }

    &-play {
      font-size: var(--fs-hero);
      @include ambient(pulse, 1.8s);
      filter: drop-shadow(0 8px 14px color-mix(in srgb, var(--color-ink) 22%, transparent));
    }

    &-cta {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--color-ink-soft);
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
