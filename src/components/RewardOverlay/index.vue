<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="reward" aria-hidden="true">
    <StarBurst />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import confetti from 'canvas-confetti'

import StarBurst from './StarBurst.vue'

import { CONFETTI_COLORS } from '@/theme/colors'

export default defineComponent({
  name: 'RewardOverlay',
  components: { StarBurst },
  mounted() {
    this.fireConfetti()
  },
  methods: {
    fireConfetti() {
      if (this.prefersReducedMotion()) return
      const colors = [...CONFETTI_COLORS]
      void confetti({ particleCount: 80, spread: 78, startVelocity: 46, origin: { y: 0.62 }, colors })
      void confetti({ particleCount: 40, angle: 60, spread: 72, origin: { x: 0, y: 0.7 }, colors })
      void confetti({ particleCount: 40, angle: 120, spread: 72, origin: { x: 1, y: 0.7 }, colors })
      window.setTimeout(() => {
        void confetti({ particleCount: 26, spread: 110, scalar: 1.5, shapes: ['star'], origin: { y: 0.5 }, colors })
      }, 240)
    },
    prefersReducedMotion(): boolean {
      if (typeof window === 'undefined' || !window.matchMedia) return false
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.reward {
  @include flex-center;
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background: color-mix(in srgb, var(--color-white) 35%, transparent);
}
</style>
