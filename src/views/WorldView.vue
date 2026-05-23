<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section v-if="world" class="world" :style="{ '--world-color': accent }">
    <header class="world__header">
      <BackButton />
      <h1 class="world__title">{{ $t(`worlds.${world.id}.name`) }}</h1>
      <SpeakerButton :text="$t(`worlds.${world.id}.prompt`)" />
    </header>
    <div class="world__games">
      <button
        v-for="game in world.games"
        :key="game.id"
        class="world__game"
        type="button"
        @click="announceComingSoon"
      >
        <span class="world__game-icon">{{ game.icon }}</span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import BackButton from '@/components/BackButton.vue'
import SpeakerButton from '@/components/SpeakerButton.vue'

import { WORLDS } from '@/constants/worlds'
import { PHRASE } from '@/constants/phrases'
import { ROUTE } from '@/constants/strings'
import type { WorldDef } from '@/types/world'

export default defineComponent({
  name: 'WorldView',
  components: { BackButton, SpeakerButton },
  props: {
    worldId: {
      type: String,
      required: true
    }
  },
  computed: {
    world(): WorldDef | undefined {
      return WORLDS.find((world) => world.id === this.worldId)
    },
    accent(): string {
      return this.world ? `var(--color-${this.world.colorToken})` : 'var(--color-primary)'
    }
  },
  mounted() {
    if (!this.world) {
      this.$router.replace({ name: ROUTE.HUB })
      return
    }
    audio.speak(this.$t(`worlds.${this.world.id}.prompt`))
  },
  methods: {
    announceComingSoon() {
      audio.playPhrase(PHRASE.comingSoon)
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.world {
  inline-size: 100%;
  max-inline-size: 60rem;

  &__header {
    display: flex;
    align-items: center;
    gap: var(--sp-md);
    margin-block-end: var(--sp-lg);
  }

  &__title {
    flex: 1;
    margin: 0;
    font-size: var(--fs-lg);
    color: var(--world-color);
  }

  &__games {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-md);

    @media (min-width: 720px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__game {
    @include flex-center;
    @include pressable;
    min-block-size: 8rem;
    background: color-mix(in srgb, var(--world-color) 18%, var(--color-surface));

    &-icon {
      font-size: var(--fs-xl);
      @include ambient(wiggle, 6s);
    }
  }
}
</style>
