<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <button
    class="speaker"
    :class="{ 'speaker--speaking': isSpeaking }"
    type="button"
    :aria-label="$t('common.repeat')"
    @click="repeat"
  >
    <span class="speaker__icon">{{ icon.SPEAKER }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import { audio } from '@/services/audio'

import { SPEAKER_POLL_MS } from '@/constants/gameConfig'
import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'SpeakerButton',
  props: {
    text: {
      type: String,
      required: true
    },
    parts: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  data() {
    return {
      isSpeaking: false,
      pollTimer: null as ReturnType<typeof setInterval> | null
    }
  },
  computed: {
    icon() {
      return ICON
    }
  },
  mounted() {
    this.pollTimer = setInterval(() => {
      this.isSpeaking = audio.isSpeaking()
    }, SPEAKER_POLL_MS)
  },
  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  },
  methods: {
    repeat() {
      if (audio.isSpeaking()) {
        audio.stop()
        return
      }
      if (this.parts.length > 0) {
        audio.speakParts(this.parts)
        return
      }
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
  position: relative;
  inline-size: var(--touch-min);
  block-size: var(--touch-min);
  background: var(--color-sun);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-pill);
    border: 3px solid var(--color-primary);
    opacity: 0;
    pointer-events: none;
  }

  &__icon {
    font-size: var(--fs-md);
  }

  &--speaking {
    .speaker__icon {
      @include ambient(pulse, 0.9s);
    }

    &::after {
      @include ambient(glow-pulse, 1s);
    }
  }
}
</style>
