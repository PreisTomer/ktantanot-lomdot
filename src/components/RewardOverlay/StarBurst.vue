<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="star-burst" aria-hidden="true">
    <span class="star-burst__core">{{ icon.STAR }}</span>
    <span
      v-for="ray in rays"
      :key="ray.id"
      ref="rays"
      class="star-burst__ray"
      :style="{ '--angle': ray.angle + 'deg' }"
      >{{ ray.glyph }}</span
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import gsap from 'gsap'

import { ICON } from '@/constants/icons'

const RAY_COUNT = 8

interface Ray {
  id: number
  angle: number
  glyph: string
}

export default defineComponent({
  name: 'StarBurst',
  data() {
    return {
      rays: Array.from({ length: RAY_COUNT }, (_, i) => ({
        id: i,
        angle: (360 / RAY_COUNT) * i,
        glyph: i % 2 === 0 ? ICON.STAR : ICON.HEART
      })) as Ray[]
    }
  },
  computed: {
    icon() {
      return ICON
    }
  },
  mounted() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rays = this.$refs.rays as HTMLElement[]
    gsap.fromTo(
      rays,
      { scale: 0, x: 0, y: 0, opacity: 1 },
      {
        scale: 1,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        x: (i: number) => Math.cos((i / RAY_COUNT) * Math.PI * 2) * 160,
        y: (i: number) => Math.sin((i / RAY_COUNT) * Math.PI * 2) * 160
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

  &__core {
    font-size: var(--fs-hero);
    animation: pop-in 0.5s var(--ease-spring) both;
    filter: drop-shadow(0 6px 10px color-mix(in srgb, var(--color-ink) 25%, transparent));
  }

  &__ray {
    position: absolute;
    font-size: var(--fs-lg);
  }
}
</style>
