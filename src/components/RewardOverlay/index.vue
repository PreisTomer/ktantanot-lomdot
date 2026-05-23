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
      void confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [...CONFETTI_COLORS]
      })
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
