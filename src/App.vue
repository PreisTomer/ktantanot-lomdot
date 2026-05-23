<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="app">
    <AnimatedBackground />
    <main class="app__stage">
      <router-view v-slot="{ Component }">
        <transition name="screen" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AnimatedBackground from '@/components/AnimatedBackground.vue'

export default defineComponent({
  name: 'App',
  components: { AnimatedBackground }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.app {
  position: relative;
  min-block-size: 100%;

  &__stage {
    @include flex-center;
    min-block-size: 100vh;
    padding: var(--sp-lg);
  }
}

.screen-enter-active,
.screen-leave-active {
  transition: opacity var(--tr-normal), transform var(--tr-normal);
}

.screen-enter-from,
.screen-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
