<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="hub">
    <header class="hub__header">
      <div class="hub__titles">
        <h1 class="hub__title">{{ $t('hub.title') }}</h1>
        <p class="hub__subtitle">{{ $t('hub.prompt') }}</p>
      </div>
      <SpeakerButton :text="$t('hub.prompt')" />
    </header>
    <div class="hub__grid">
      <WorldCard
        v-for="world in worlds"
        :key="world.id"
        :world="world"
        @select="openWorld"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { audio } from '@/services/audio'

import SpeakerButton from '@/components/SpeakerButton.vue'
import WorldCard from '@/components/WorldCard.vue'

import { WORLDS } from '@/constants/worlds'
import { ROUTE } from '@/constants/strings'
import type { WorldDef } from '@/types/world'

export default defineComponent({
  name: 'HubView',
  components: { SpeakerButton, WorldCard },
  computed: {
    worlds(): WorldDef[] {
      return WORLDS
    }
  },
  mounted() {
    audio.speak(this.$t('hub.prompt'))
  },
  methods: {
    openWorld(world: WorldDef) {
      audio.speak(this.$t(`worlds.${world.id}.prompt`))
      this.$router.push({ name: ROUTE.WORLD, params: { worldId: world.id } })
    }
  }
})
</script>

<style lang="scss" scoped>
.hub {
  inline-size: 100%;
  max-inline-size: 64rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-md);
    margin-block-end: var(--sp-xl);
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: var(--sp-xs);
  }

  &__title {
    margin: 0;
    font-size: var(--fs-2xl);
    font-weight: 700;
    color: var(--color-ink);
  }

  &__subtitle {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--color-ink-soft);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-lg);

    @media (min-width: 760px) {
      grid-template-columns: repeat(4, 1fr);
    }

    // Staggered entrance via CSS only: leaves no inline styles, so a settled
    // grid is always in clean alignment regardless of how fast the user
    // navigates (backwards fill releases to natural state, keeping :active).
    > * {
      animation: bounce-in 0.5s var(--ease-spring) backwards;
    }

    @for $i from 1 through 6 {
      > :nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.08}s;
      }
    }
  }
}
</style>
