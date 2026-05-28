<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="reward" :class="`reward--${tier}`" aria-hidden="true">
    <StarBurst :tier="tier" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import confetti from 'canvas-confetti'

import StarBurst from './StarBurst.vue'

import { CONFETTI_COLORS } from '@/theme/colors'

import { REWARD_TIER } from '@/constants/strings'
import type { RewardTier } from '@/constants/strings'

export default defineComponent({
  name: 'RewardOverlay',
  components: { StarBurst },
  props: {
    tier: {
      type: String as PropType<RewardTier>,
      default: REWARD_TIER.STANDARD
    }
  },
  mounted() {
    this.fireConfetti()
  },
  methods: {
    fireConfetti() {
      if (this.prefersReducedMotion()) return
      const colors = [...CONFETTI_COLORS]
      if (this.tier === REWARD_TIER.SMALL) {
        void confetti({ particleCount: 28, spread: 60, startVelocity: 36, origin: { y: 0.62 }, colors })
        return
      }
      void confetti({ particleCount: 80, spread: 78, startVelocity: 46, origin: { y: 0.62 }, colors })
      void confetti({ particleCount: 40, angle: 60, spread: 72, origin: { x: 0, y: 0.7 }, colors })
      void confetti({ particleCount: 40, angle: 120, spread: 72, origin: { x: 1, y: 0.7 }, colors })
      window.setTimeout(() => {
        void confetti({ particleCount: 26, spread: 110, scalar: 1.5, shapes: ['star'], origin: { y: 0.5 }, colors })
      }, 240)
      if (this.tier === REWARD_TIER.BIG || this.tier === REWARD_TIER.FINISH) {
        // Rainbow ribbon: a wide overhead burst that drifts down behind the star.
        window.setTimeout(() => {
          void confetti({ particleCount: 60, angle: 90, spread: 180, scalar: 0.9, origin: { y: 0 }, colors })
        }, 360)
      }
      if (this.tier === REWARD_TIER.FINISH) {
        // Session-win finale: one more huge centred burst, slightly later.
        window.setTimeout(() => {
          void confetti({ particleCount: 140, spread: 160, scalar: 1.2, shapes: ['star', 'circle'], origin: { y: 0.4 }, colors })
        }, 760)
      }
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

  &--small {
    background: color-mix(in srgb, var(--color-white) 20%, transparent);
  }

  &--finish {
    background: color-mix(in srgb, var(--color-white) 55%, transparent);
  }
}
</style>
