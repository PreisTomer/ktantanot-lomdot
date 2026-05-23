<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <component :is="entry.is" v-bind="entry.props" v-if="entry" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Component } from 'vue'

import FindGame from '@/components/games/FindGame.vue'
import MathGame from '@/components/games/MathGame.vue'
import CountGame from '@/components/games/CountGame.vue'
import LetterTraceGame from '@/components/games/LetterTraceGame.vue'
import MatchPairsGame from '@/components/games/MatchPairsGame.vue'

import { HEBREW_LETTERS, NUMBERS } from '@/constants/alphabet'
import { GAME_ID, ROUTE } from '@/constants/strings'
import type { GameId } from '@/constants/strings'

interface GameEntry {
  is: Component
  props: Record<string, string | string[]>
}

const REGISTRY: Record<GameId, GameEntry> = {
  [GAME_ID.LETTER_FIND]: {
    is: FindGame,
    props: { pool: [...HEBREW_LETTERS], baseKey: 'games.letterFind', paramName: 'letter' }
  },
  [GAME_ID.NUMBER_FIND]: {
    is: FindGame,
    props: { pool: NUMBERS, baseKey: 'games.numberFind', paramName: 'number' }
  },
  [GAME_ID.COUNT]: { is: CountGame, props: {} },
  [GAME_ID.ADD]: { is: MathGame, props: { mode: 'add' } },
  [GAME_ID.SUBTRACT]: { is: MathGame, props: { mode: 'subtract' } },
  [GAME_ID.LETTER_TRACE]: { is: LetterTraceGame, props: {} },
  [GAME_ID.MATCH_PAIRS]: { is: MatchPairsGame, props: {} }
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
