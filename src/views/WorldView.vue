<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <section v-if="world" class="world" :style="{ '--tile-color': accent }">
    <header class="world__header">
      <BackButton />
      <h1 class="world__title">{{ $t(`worlds.${world.id}.name`) }}</h1>
      <SpeakerButton :text="$t(`worlds.${world.id}.prompt`)" />
    </header>
    <div ref="grid" class="world__games">
      <button
        v-for="game in world.games"
        :key="game.id"
        class="world__game"
        type="button"
        @click="openGame(game)"
      >
        <span v-if="!isReady(game.id)" class="world__badge">{{ $t('games.soonBadge') }}</span>
        <span class="world__game-icon">{{ game.icon }}</span>
        <span class="world__game-name">{{ $t(`games.${game.id}.title`) }}</span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import gsap from 'gsap'

import { audio } from '@/services/audio'

import BackButton from '@/components/BackButton.vue'
import SpeakerButton from '@/components/SpeakerButton.vue'

import { READY_GAMES, WORLDS } from '@/constants/worlds'
import { ROUTE } from '@/constants/strings'
import type { GameId } from '@/constants/strings'
import type { GameDef, WorldDef } from '@/types/world'

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
    this.animateIn()
  },
  methods: {
    isReady(gameId: GameId): boolean {
      return READY_GAMES.has(gameId)
    },
    animateIn() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const grid = this.$refs.grid as HTMLElement | undefined
      if (!grid) return
      // Defer past the route enter-transition so GSAP doesn't race the
      // ancestor transform; clearProps strips inline styles so tiles settle
      // back into clean grid alignment.
      requestAnimationFrame(() => {
        gsap.from(grid.children, {
          y: 40,
          opacity: 0,
          duration: 0.45,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: true,
          clearProps: 'all'
        })
      })
    },
    openGame(game: GameDef) {
      this.$router.push({ name: ROUTE.GAME, params: { gameId: game.id } })
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.world {
  inline-size: 100%;
  max-inline-size: 64rem;

  &__header {
    display: flex;
    align-items: center;
    gap: var(--sp-md);
    margin-block-end: var(--sp-xl);
  }

  &__title {
    flex: 1;
    margin: 0;
    font-size: var(--fs-2xl);
    font-weight: 700;
    color: var(--tile-color, var(--color-ink));
  }

  &__games {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-lg);

    @media (min-width: 760px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__game {
    @include flex-column-center;
    @include dimensional-tile;
    gap: var(--sp-sm);
    min-block-size: 10rem;
    padding: var(--sp-lg);
    color: var(--color-white);

    &-icon {
      font-size: var(--fs-display);
      line-height: 1;
      filter: drop-shadow(0 5px 5px color-mix(in srgb, var(--color-ink) 22%, transparent));
      @include ambient(float, 5s);
    }

    &-name {
      font-size: var(--fs-sm);
      font-weight: 700;
      text-shadow: 0 2px 6px color-mix(in srgb, var(--color-ink) 30%, transparent);
    }
  }

  &__badge {
    position: absolute;
    inset-block-start: var(--sp-sm);
    inset-inline-end: var(--sp-sm);
    padding: 0.2rem var(--sp-sm);
    font-size: var(--fs-xs);
    font-weight: 700;
    color: var(--color-ink);
    background: var(--color-sun);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);
  }
}
</style>
