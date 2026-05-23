<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="soon">
    <GameHeader :title="$t(titleKey)" :prompt="$t('games.comingSoon')" />
    <div class="soon__stage">
      <span class="soon__icon">{{ icon.STAR }}</span>
      <p class="soon__text">{{ $t('games.comingSoon') }}</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import GameHeader from '@/components/GameHeader.vue'

import { ICON } from '@/constants/icons'

export default defineComponent({
  name: 'ComingSoonGame',
  components: { GameHeader },
  props: {
    titleKey: {
      type: String,
      required: true
    }
  },
  computed: {
    icon() {
      return ICON
    }
  },
  mounted() {
    audio.speak(this.$t('games.comingSoon'))
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.soon {
  inline-size: 100%;
  max-inline-size: 48rem;

  &__stage {
    @include flex-column-center;
    gap: var(--sp-lg);
    padding: var(--sp-xl) var(--sp-lg);
    text-align: center;
  }

  &__icon {
    font-size: var(--fs-display);
    @include ambient(pulse, 2.5s);
  }

  &__text {
    margin: 0;
    font-size: var(--fs-md);
    color: var(--color-ink);
  }
}
</style>
