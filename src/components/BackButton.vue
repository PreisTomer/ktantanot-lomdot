<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button class="back" type="button" :aria-label="$t('common.back')" @click="goHome">
    <span class="back__icon">{{ icon.HOME }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ICON } from '@/constants/icons'
import { ROUTE } from '@/constants/strings'

export default defineComponent({
  name: 'BackButton',
  computed: {
    icon() {
      return ICON
    }
  },
  methods: {
    goHome() {
      this.$router.push({ name: ROUTE.HUB })
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.back {
  @include flex-center;
  @include touch-target;
  @include pressable;
  inline-size: var(--touch-min);
  block-size: var(--touch-min);
  background: var(--color-surface);

  &__icon {
    font-size: var(--fs-md);
  }
}
</style>
