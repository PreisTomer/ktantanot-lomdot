<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section class="hub">
    <header class="hub__header">
      <h1 class="hub__title">{{ $t('hub.title') }}</h1>
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
@use '@/styles/mixins' as *;

.hub {
  inline-size: 100%;
  max-inline-size: 60rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-md);
    margin-block-end: var(--sp-lg);
  }

  &__title {
    margin: 0;
    font-size: var(--fs-lg);
    color: var(--color-ink);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-md);

    @media (min-width: 720px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>
