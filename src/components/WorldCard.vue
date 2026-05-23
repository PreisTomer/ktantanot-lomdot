<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button
    class="world-card"
    type="button"
    :style="{ '--tile-color': accent }"
    :aria-label="$t(`worlds.${world.id}.name`)"
    @click="select"
  >
    <span class="world-card__halo"></span>
    <span class="world-card__icon">{{ world.icon }}</span>
    <span class="world-card__name">{{ $t(`worlds.${world.id}.name`) }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import type { WorldDef } from '@/types/world'

export default defineComponent({
  name: 'WorldCard',
  props: {
    world: {
      type: Object as PropType<WorldDef>,
      required: true
    }
  },
  emits: ['select'],
  computed: {
    accent(): string {
      return `var(--color-${this.world.colorToken})`
    }
  },
  methods: {
    select() {
      this.$emit('select', this.world)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.world-card {
  @include flex-column-center;
  @include dimensional-tile;
  gap: var(--sp-sm);
  inline-size: 100%;
  min-block-size: 12rem;
  padding: var(--sp-lg);
  color: var(--color-white);

  &__halo {
    position: absolute;
    inline-size: 70%;
    aspect-ratio: 1;
    inset-block-start: 12%;
    border-radius: var(--radius-pill);
    background: radial-gradient(circle, color-mix(in srgb, white 40%, transparent), transparent 70%);
    pointer-events: none;
  }

  &__icon {
    position: relative;
    font-size: var(--fs-hero);
    line-height: 1;
    filter: drop-shadow(0 6px 6px color-mix(in srgb, var(--color-ink) 22%, transparent));
    @include ambient(float, 4.5s);
  }

  &__name {
    position: relative;
    font-size: var(--fs-lg);
    font-weight: 700;
    text-shadow: 0 2px 6px color-mix(in srgb, var(--color-ink) 30%, transparent);
  }
}
</style>
