<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="star-burst" aria-hidden="true">
    <span class="star-burst__star">{{ icon.STAR }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'StarBurst',
  computed: {
    icon() {
      return ICON
    }
  }
})
</script>

<style lang="scss" scoped>
.star-burst {
  &__star {
    display: block;
    font-size: var(--fs-display);
    animation: pop-in 0.5s var(--ease-spring) both;
  }
}
</style>
