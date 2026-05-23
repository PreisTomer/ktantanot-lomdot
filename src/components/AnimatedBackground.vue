<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="bg" aria-hidden="true">
    <div class="bg__sky"></div>
    <span class="bg__orb bg__orb--1"></span>
    <span class="bg__orb bg__orb--2"></span>
    <span class="bg__orb bg__orb--3"></span>
    <span class="bg__orb bg__orb--4"></span>
    <span class="bg__bubble bg__bubble--1"></span>
    <span class="bg__bubble bg__bubble--2"></span>
    <span class="bg__bubble bg__bubble--3"></span>
    <span class="bg__bubble bg__bubble--4"></span>
    <span class="bg__bubble bg__bubble--5"></span>
    <span class="bg__bubble bg__bubble--6"></span>
    <div class="bg__hill bg__hill--far"></div>
    <div class="bg__hill bg__hill--near"></div>
    <span class="bg__star bg__star--1"></span>
    <span class="bg__star bg__star--2"></span>
    <span class="bg__star bg__star--3"></span>
    <span class="bg__star bg__star--4"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// Per-orb parallax depth (px of travel across the full viewport).
const ORB_DEPTH = [26, 40, 18, 52]

export default defineComponent({
  name: 'AnimatedBackground',
  data() {
    return {
      orbs: [] as HTMLElement[],
      pointerHandler: null as ((event: PointerEvent) => void) | null
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    this.orbs = Array.from(this.$el.querySelectorAll('.bg__orb'))
    this.pointerHandler = (event: PointerEvent) => this.applyParallax(event)
    window.addEventListener('pointermove', this.pointerHandler, { passive: true })
  },
  beforeUnmount() {
    if (this.pointerHandler) window.removeEventListener('pointermove', this.pointerHandler)
  },
  methods: {
    applyParallax(event: PointerEvent) {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      this.orbs.forEach((orb, index) => {
        const depth = ORB_DEPTH[index % ORB_DEPTH.length]
        orb.style.translate = `${(-nx * depth).toFixed(1)}px ${(-ny * depth).toFixed(1)}px`
      })
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

  &__sky {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120% 80% at 70% -10%, color-mix(in srgb, var(--color-sky) 38%, var(--color-bg)) 0%, transparent 60%),
      linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
  }

  &__orb {
    position: absolute;
    border-radius: var(--radius-pill);
    filter: blur(6px);
    opacity: var(--op-ghost);

    &--1 {
      inline-size: 320px;
      block-size: 320px;
      inset-block-start: -80px;
      inset-inline-end: -60px;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-sky) 70%, white), var(--color-sky));
      @include ambient(float, 9s);
    }

    &--2 {
      inline-size: 240px;
      block-size: 240px;
      inset-block-end: 6%;
      inset-inline-start: -50px;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-coral) 70%, white), var(--color-coral));
      @include ambient(drift, 12s);
    }

    &--3 {
      inline-size: 180px;
      block-size: 180px;
      inset-block-start: 32%;
      inset-inline-start: 14%;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-leaf) 70%, white), var(--color-leaf));
      @include ambient(float, 11s);
    }

    &--4 {
      inline-size: 150px;
      block-size: 150px;
      inset-block-start: 12%;
      inset-inline-start: 44%;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-grape) 70%, white), var(--color-grape));
      @include ambient(drift, 10s);
    }
  }

  &__hill {
    position: absolute;
    inset-inline: -10%;
    border-start-start-radius: 50%;
    border-start-end-radius: 50%;

    &--far {
      inset-block-end: 0;
      block-size: 22%;
      background: color-mix(in srgb, var(--color-leaf) 40%, var(--color-bg-2));
    }

    &--near {
      inset-block-end: 0;
      block-size: 13%;
      background: color-mix(in srgb, var(--color-leaf) 60%, var(--color-bg-2));
    }
  }

  &__bubble {
    position: absolute;
    inline-size: 56px;
    block-size: 56px;
    border-radius: var(--radius-pill);
    opacity: 0;
    background: radial-gradient(
      circle at 30% 26%,
      color-mix(in srgb, white 85%, transparent) 0%,
      color-mix(in srgb, var(--bubble-tint) 32%, transparent) 52%,
      transparent 72%
    );
    box-shadow: inset 0 0 12px color-mix(in srgb, white 50%, transparent);
    @include decorative-from(600px);

    &--1 {
      --bubble-tint: var(--color-sky);
      inset-inline-start: 12%;
      inset-block-end: -70px;
      @include ambient(rise, 19s);
      animation-delay: -3s;
    }

    &--2 {
      --bubble-tint: var(--color-coral);
      inline-size: 40px;
      block-size: 40px;
      inset-inline-start: 30%;
      inset-block-end: -60px;
      @include ambient(rise, 24s);
      animation-delay: -11s;
    }

    &--3 {
      --bubble-tint: var(--color-leaf);
      inline-size: 72px;
      block-size: 72px;
      inset-inline-start: 52%;
      inset-block-end: -90px;
      @include ambient(rise, 22s);
      animation-delay: -7s;
    }

    &--4 {
      --bubble-tint: var(--color-grape);
      inline-size: 46px;
      block-size: 46px;
      inset-inline-end: 16%;
      inset-block-end: -64px;
      @include ambient(rise, 18s);
      animation-delay: -14s;
    }

    &--5 {
      --bubble-tint: var(--color-sun);
      inline-size: 34px;
      block-size: 34px;
      inset-inline-end: 34%;
      inset-block-end: -54px;
      @include ambient(rise, 26s);
      animation-delay: -5s;
    }

    &--6 {
      --bubble-tint: var(--color-sky);
      inline-size: 60px;
      block-size: 60px;
      inset-inline-start: 74%;
      inset-block-end: -80px;
      @include ambient(rise, 21s);
      animation-delay: -18s;
    }
  }

  &__star {
    position: absolute;
    inline-size: 26px;
    block-size: 26px;
    background: radial-gradient(circle at 50% 50%, var(--color-white), var(--color-sun) 70%);
    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
    opacity: var(--op-muted);
    @include decorative-from(900px);

    &--1 {
      inset-block-start: 18%;
      inset-inline-start: 24%;
      inline-size: 30px;
      block-size: 30px;
      @include ambient(twinkle, 4s);
    }

    &--2 {
      inset-block-start: 60%;
      inset-inline-end: 20%;
      @include ambient(twinkle, 5s);
    }

    &--3 {
      inset-block-start: 30%;
      inset-inline-end: 30%;
      inline-size: 20px;
      block-size: 20px;
      @include ambient(twinkle, 6s);
    }

    &--4 {
      inset-block-start: 74%;
      inset-inline-start: 16%;
      inline-size: 18px;
      block-size: 18px;
      @include ambient(twinkle, 5.5s);
    }
  }
}
</style>
