<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button class="speaker" type="button" :aria-label="$t('common.repeat')" @click="repeat">
    <span class="speaker__icon">{{ icon.SPEAKER }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'SpeakerButton',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    icon() {
      return ICON
    }
  },
  methods: {
    repeat() {
      audio.speak(this.text)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.speaker {
  @include flex-center;
  @include touch-target;
  @include pressable;
  inline-size: var(--touch-min);
  block-size: var(--touch-min);
  background: var(--color-sun);

  &__icon {
    font-size: var(--fs-md);
  }
}
</style>
