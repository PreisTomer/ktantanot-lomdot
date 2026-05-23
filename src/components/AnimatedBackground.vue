<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="bg" aria-hidden="true">
    <span class="bg__blob bg__blob--1"></span>
    <span class="bg__blob bg__blob--2"></span>
    <span class="bg__blob bg__blob--3"></span>
    <span class="bg__sparkle bg__sparkle--1">{{ icon.STAR }}</span>
    <span class="bg__sparkle bg__sparkle--2">{{ icon.HEART }}</span>
    <span class="bg__sparkle bg__sparkle--3">{{ icon.STAR }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'AnimatedBackground',
  computed: {
    icon() {
      return ICON
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(160deg, var(--color-bg) 0%, var(--color-bg-2) 100%);

  &__blob {
    position: absolute;
    border-radius: var(--radius-pill);
    filter: blur(2px);
    opacity: var(--op-ghost);

    &--1 {
      inline-size: 240px;
      block-size: 240px;
      inset-block-start: -60px;
      inset-inline-end: -40px;
      background: color-mix(in srgb, var(--color-sky) 60%, transparent);
      @include ambient(float, 7s);
    }

    &--2 {
      inline-size: 180px;
      block-size: 180px;
      inset-block-end: -50px;
      inset-inline-start: -30px;
      background: color-mix(in srgb, var(--color-coral) 55%, transparent);
      @include ambient(drift, 9s);
    }

    &--3 {
      inline-size: 140px;
      block-size: 140px;
      inset-block-start: 40%;
      inset-inline-start: 12%;
      background: color-mix(in srgb, var(--color-leaf) 55%, transparent);
      @include ambient(float, 11s);
    }
  }

  &__sparkle {
    position: absolute;
    font-size: var(--fs-lg);
    opacity: var(--op-ghost);
    @include decorative-from(900px);

    &--1 {
      inset-block-start: 18%;
      inset-inline-start: 22%;
      @include ambient(twinkle, 4s);
    }

    &--2 {
      inset-block-start: 64%;
      inset-inline-end: 18%;
      @include ambient(twinkle, 5s);
    }

    &--3 {
      inset-block-end: 14%;
      inset-inline-start: 40%;
      @include ambient(twinkle, 6s);
    }
  }
}
</style>
