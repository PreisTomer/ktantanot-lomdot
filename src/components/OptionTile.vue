<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button
    class="option"
    :class="{ 'option--shake': shake }"
    type="button"
    :disabled="disabled"
    @click="pick"
  >
    <span class="option__label" dir="ltr">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OptionTile',
  props: {
    label: {
      type: String,
      required: true
    },
    shake: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['pick'],
  methods: {
    pick() {
      this.$emit('pick', this.label)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.option {
  @include flex-center;
  @include pressable;
  min-block-size: 6rem;
  background: var(--color-surface);

  &--shake {
    animation: wiggle 0.4s ease both;
  }

  &:disabled {
    opacity: var(--op-strong);
  }

  &__label {
    font-size: var(--fs-display);
    font-weight: 700;
    color: var(--color-ink);
  }
}
</style>
