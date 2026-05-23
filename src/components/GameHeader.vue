<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <header class="game-header">
    <BackButton />
    <h1 class="game-header__title">{{ title }}</h1>
    <SpeakerButton :text="prompt" />
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import BackButton from '@/components/BackButton.vue'
import SpeakerButton from '@/components/SpeakerButton.vue'

export default defineComponent({
  name: 'GameHeader',
  components: { BackButton, SpeakerButton },
  props: {
    title: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.game-header {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  margin-block-end: var(--sp-md);

  &__title {
    flex: 1;
    margin: 0;
    font-size: var(--fs-lg);
    color: var(--color-ink);
  }
}
</style>
