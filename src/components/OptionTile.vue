<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button
    class="option"
    :class="{ 'option--shake': shake }"
    :style="{ '--tile-color': tileColor }"
    type="button"
    :disabled="disabled"
    @click="pick"
  >
    <span class="option__label" dir="ltr">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const TONES = ['sky', 'coral', 'leaf', 'sun', 'grape'] as const

type Tone = (typeof TONES)[number]

export default defineComponent({
  name: 'OptionTile',
  props: {
    label: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      default: 'sun',
      validator: (value: string) => (TONES as readonly string[]).includes(value)
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
  computed: {
    tileColor(): string {
      return `var(--color-${this.tone as Tone})`
    }
  },
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
  @include dimensional-tile;
  min-block-size: 6.5rem;

  &--shake {
    animation: wiggle 0.4s ease both;
  }

  &:disabled {
    opacity: var(--op-strong);
  }

  &__label {
    position: relative;
    font-size: var(--fs-2xl);
    font-weight: 700;
    color: var(--color-white);
    text-shadow: 0 2px 6px color-mix(in srgb, var(--color-ink) 35%, transparent);
  }
}
</style>
