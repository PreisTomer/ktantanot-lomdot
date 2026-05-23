<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="dots" role="presentation">
    <span
      v-for="dot in total"
      :key="dot"
      class="dots__dot"
      :class="{ 'dots__dot--done': dot <= current }"
    ></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProgressDots',
  props: {
    total: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.dots {
  display: flex;
  gap: var(--sp-xs);

  &__dot {
    inline-size: var(--sp-md);
    block-size: var(--sp-md);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--color-ink) 15%, transparent);
    transition: background var(--tr-normal), transform var(--tr-normal);

    &--done {
      background: var(--color-sun);
      transform: scale(1.15);
    }
  }
}
</style>
