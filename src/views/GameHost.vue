<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <component :is="entry.is" v-bind="entry.props" v-if="entry" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Component } from 'vue'

import SyllableTrainGame from '@/components/games/SyllableTrain/index.vue'
import CatchWordGame from '@/components/games/CatchWord/index.vue'
import DetectiveGame from '@/components/games/Detective/index.vue'
import ThiefMonkeyGame from '@/components/games/ThiefMonkey/index.vue'
import FrogJumpsGame from '@/components/games/FrogJumps/index.vue'
import ComingSoonGame from '@/components/games/ComingSoonGame.vue'

import { GAME_ID, ROUTE } from '@/constants/strings'
import type { GameId } from '@/constants/strings'

interface GameEntry {
  is: Component
  props: Record<string, string>
}

function comingSoon(id: GameId): GameEntry {
  return { is: ComingSoonGame, props: { titleKey: `games.${id}.title` } }
}

const REGISTRY: Record<GameId, GameEntry> = {
  [GAME_ID.SYLLABLE_TRAIN]: { is: SyllableTrainGame, props: {} },
  [GAME_ID.CATCH_WORD]: { is: CatchWordGame, props: {} },
  [GAME_ID.SOUND_DETECTIVE]: { is: DetectiveGame, props: {} },
  [GAME_ID.MAGIC_BOOK]: comingSoon(GAME_ID.MAGIC_BOOK),
  [GAME_ID.BEAR_RESTAURANT]: comingSoon(GAME_ID.BEAR_RESTAURANT),
  [GAME_ID.THIEF_MONKEY]: { is: ThiefMonkeyGame, props: {} },
  [GAME_ID.FROG_JUMPS]: { is: FrogJumpsGame, props: {} },
  [GAME_ID.BUILD_TOWER]: comingSoon(GAME_ID.BUILD_TOWER),
  [GAME_ID.WHAT_IN_ROOM]: comingSoon(GAME_ID.WHAT_IN_ROOM),
  [GAME_ID.SOUND_SIMON]: comingSoon(GAME_ID.SOUND_SIMON),
  [GAME_ID.WHERE_HIDDEN]: comingSoon(GAME_ID.WHERE_HIDDEN),
  [GAME_ID.COMPLETE_SEQUENCE]: comingSoon(GAME_ID.COMPLETE_SEQUENCE),
  [GAME_ID.REMEMBER_PATH]: comingSoon(GAME_ID.REMEMBER_PATH),
  [GAME_ID.SISTERS_MISSION]: comingSoon(GAME_ID.SISTERS_MISSION)
}

export default defineComponent({
  name: 'GameHost',
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  computed: {
    entry(): GameEntry | undefined {
      return REGISTRY[this.gameId as GameId]
    }
  },
  created() {
    if (!this.entry) {
      this.$router.replace({ name: ROUTE.HUB })
    }
  }
})
</script>
