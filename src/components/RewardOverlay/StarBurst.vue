<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="star-burst" :class="`star-burst--${tier}`" aria-hidden="true">
    <span class="star-burst__glow"></span>
    <span class="star-burst__ring"></span>
    <span class="star-burst__core">{{ icon.STAR }}</span>
    <span
      v-for="ray in rays"
      :key="ray.id"
      ref="rays"
      class="star-burst__ray"
      >{{ ray.glyph }}</span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import gsap from 'gsap'

import { ICON } from '@/constants/icons'
import { REWARD_TIER } from '@/constants/strings'
import type { RewardTier } from '@/constants/strings'

const RAY_GLYPHS = [ICON.STAR, ICON.HEART, ICON.SPARKLE]
const RAYS_BY_TIER: Record<RewardTier, number> = {
  small: 6,
  standard: 12,
  big: 16,
  finish: 18
}
const SCALE_BY_TIER: Record<RewardTier, number> = {
  small: 0.6,
  standard: 1,
  big: 1.35,
  finish: 1.5
}

interface Ray {
  id: number
  glyph: string
}

export default defineComponent({
  name: 'StarBurst',
  props: {
    tier: {
      type: String as PropType<RewardTier>,
      default: REWARD_TIER.STANDARD
    }
  },
  computed: {
    icon() {
      return ICON
    },
    rays(): Ray[] {
      const count = RAYS_BY_TIER[this.tier]
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        glyph: RAY_GLYPHS[i % RAY_GLYPHS.length]
      }))
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rays = this.$refs.rays as HTMLElement[]
    const scaleMul = SCALE_BY_TIER[this.tier]
    const count = rays.length
    gsap.fromTo(
      rays,
      { scale: 0, x: 0, y: 0, opacity: 1, rotation: 0 },
      {
        scale: (i: number) => (0.7 + (i % 3) * 0.25) * scaleMul,
        opacity: 0,
        rotation: (i: number) => (i % 2 === 0 ? 140 : -140),
        duration: 1.1,
        ease: 'power2.out',
        x: (i: number) => Math.cos((i / count) * Math.PI * 2) * (150 + (i % 3) * 40) * scaleMul,
        y: (i: number) => Math.sin((i / count) * Math.PI * 2) * (150 + (i % 3) * 40) * scaleMul
      }
    )
  }
})
</script>

<style lang="scss" scoped>
.star-burst {
  position: relative;
  display: grid;
  place-items: center;

  &__glow {
    position: absolute;
    inline-size: 320px;
    block-size: 320px;
    border-radius: var(--radius-pill);
    background: radial-gradient(circle, color-mix(in srgb, var(--color-sun) 75%, transparent) 0%, transparent 65%);
    animation: glow-pulse 1.4s var(--ease-spring) both;
  }

  &__ring {
    position: absolute;
    inline-size: 180px;
    block-size: 180px;
    border-radius: var(--radius-pill);
    border: 8px solid color-mix(in srgb, var(--color-sun) 80%, white);
    animation: shockwave 0.9s ease-out both;
  }

  &__core {
    font-size: var(--fs-display);
    animation: pop-in 0.55s var(--ease-spring) both, spin-slow 3.6s linear 0.55s infinite;
    filter: drop-shadow(0 8px 14px color-mix(in srgb, var(--color-ink) 28%, transparent));
  }

  &__ray {
    position: absolute;
    font-size: var(--fs-lg);
    filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--color-ink) 18%, transparent));
  }

  &--small {
    .star-burst__glow { inline-size: 220px; block-size: 220px; }
    .star-burst__ring { inline-size: 120px; block-size: 120px; border-width: 6px; }
    .star-burst__core { font-size: var(--fs-xl); }
  }

  &--big {
    .star-burst__glow { inline-size: 420px; block-size: 420px; }
    .star-burst__ring { inline-size: 240px; block-size: 240px; border-width: 10px; }
  }

  &--finish {
    .star-burst__glow { inline-size: 500px; block-size: 500px; }
    .star-burst__ring { inline-size: 280px; block-size: 280px; border-width: 12px; }
  }
}
</style>
