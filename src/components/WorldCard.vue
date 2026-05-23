<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button
    class="world-card"
    type="button"
    :style="{ '--world-color': accent }"
    :aria-label="$t(`worlds.${world.id}.name`)"
    @click="select"
  >
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
  @include pressable;
  gap: var(--sp-sm);
  inline-size: 100%;
  min-block-size: 9rem;
  padding: var(--sp-lg);
  background: var(--world-color);
  color: var(--color-white);

  &__icon {
    font-size: var(--fs-xl);
    line-height: 1;
    @include ambient(pulse, 5s);
  }

  &__name {
    font-size: var(--fs-md);
    font-weight: 700;
  }
}
</style>
