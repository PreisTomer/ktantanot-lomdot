<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="lang" role="group" aria-label="Language / שפה">
    <button
      v-for="option in options"
      :key="option.code"
      class="lang__opt"
      :class="{ 'lang__opt--active': locale === option.code }"
      type="button"
      :aria-pressed="locale === option.code"
      :aria-label="option.label"
      @click="choose(option.code)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { applyLocale } from '@/i18n'

import { LOCALE } from '@/constants/strings'
import type { Locale } from '@/constants/strings'

interface LangOption {
  code: Locale
  short: string
  label: string
}

export default defineComponent({
  name: 'LanguageToggle',
  data() {
    return {
      options: [
        { code: LOCALE.HE, short: 'עב', label: 'עִבְרִית' },
        { code: LOCALE.EN, short: 'EN', label: 'English' }
      ] as LangOption[]
    }
  },
  computed: {
    locale(): string {
      return this.$i18n.locale
    }
  },
  methods: {
    choose(code: Locale) {
      if (this.locale === code) return
      applyLocale(code)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.lang {
  display: inline-flex;
  padding: 4px;
  gap: 4px;
  background: var(--color-surface);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-soft);

  &__opt {
    @include flex-center;
    min-inline-size: 3rem;
    min-block-size: 2.6rem;
    padding: 0 var(--sp-sm);
    font-size: var(--fs-sm);
    font-weight: 700;
    color: var(--color-ink-soft);
    border-radius: var(--radius-pill);
    transition: color var(--tr-fast), background var(--tr-fast), transform var(--tr-fast);

    &--active {
      color: var(--color-white);
      background: var(--color-primary);
      box-shadow: var(--shadow-press);
    }

    &:active {
      transform: scale(0.94);
    }
  }
}
</style>
