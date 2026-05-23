<!-- Copyright © 2026 Tomer Preis. Licensed under the MIT License. -->
<template>
  <div class="bg" aria-hidden="true">
    <div class="bg__sky"></div>
    <span class="bg__orb bg__orb--1"></span>
    <span class="bg__orb bg__orb--2"></span>
    <span class="bg__orb bg__orb--3"></span>
    <span class="bg__orb bg__orb--4"></span>
    <span class="bg__bubble bg__bubble--1"></span>
    <span class="bg__bubble bg__bubble--2"></span>
    <span class="bg__bubble bg__bubble--3"></span>
    <span class="bg__bubble bg__bubble--4"></span>
    <span class="bg__bubble bg__bubble--5"></span>
    <span class="bg__bubble bg__bubble--6"></span>
    <div class="bg__hill bg__hill--far"></div>
    <div class="bg__hill bg__hill--near"></div>

    <svg
      class="bg__scene"
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <path class="bg__scene-grass" d="M0,150 C 220,128 360,146 560,140 C 780,133 1000,154 1200,142 L1200,240 L0,240 Z" />

      <g class="bg__scene-tree">
        <rect class="bg__scene-trunk" x="142" y="104" width="16" height="48" rx="5" />
        <g class="bg__scene-canopy" style="transform-origin: 150px 120px">
          <circle class="bg__scene-leaves" cx="150" cy="96" r="34" />
          <circle class="bg__scene-leaves" cx="123" cy="115" r="23" />
          <circle class="bg__scene-leaves" cx="177" cy="115" r="23" />
          <circle class="bg__scene-leaves--hi" cx="140" cy="84" r="11" />
        </g>
      </g>

      <g class="bg__scene-tree">
        <rect class="bg__scene-trunk" x="1042" y="116" width="13" height="38" rx="4" />
        <g class="bg__scene-canopy" style="transform-origin: 1048px 130px">
          <circle class="bg__scene-leaves" cx="1048" cy="110" r="26" />
          <circle class="bg__scene-leaves" cx="1028" cy="124" r="18" />
          <circle class="bg__scene-leaves" cx="1068" cy="124" r="18" />
        </g>
      </g>

      <g class="bg__scene-house">
        <rect class="bg__scene-chimney" x="652" y="36" width="18" height="30" rx="2" />
        <circle class="bg__scene-smoke bg__scene-smoke--1" cx="661" cy="32" r="6" />
        <circle class="bg__scene-smoke bg__scene-smoke--2" cx="668" cy="22" r="5" />
        <rect class="bg__scene-wall" x="512" y="60" width="176" height="92" rx="5" />
        <path class="bg__scene-roof" d="M496,62 L600,12 L704,62 Z" />
        <rect class="bg__scene-window" x="540" y="82" width="32" height="30" rx="3" />
        <path class="bg__scene-window-bar" d="M556,82 V112 M540,97 H572" />
        <rect class="bg__scene-door" x="578" y="90" width="44" height="62" rx="9" />
        <circle class="bg__scene-knob" cx="612" cy="122" r="3.2" />
      </g>

      <g class="bg__scene-shroom">
        <rect class="bg__scene-stem" x="334" y="130" width="12" height="22" rx="5" />
        <path class="bg__scene-cap" d="M320,132 q20,-26 40,0 Z" />
        <circle class="bg__scene-spot" cx="334" cy="124" r="2.6" />
        <circle class="bg__scene-spot" cx="346" cy="128" r="2" />
      </g>
      <g class="bg__scene-shroom">
        <rect class="bg__scene-stem" x="766" y="134" width="9" height="18" rx="4" />
        <path class="bg__scene-cap" d="M755,136 q15,-20 30,0 Z" />
        <circle class="bg__scene-spot" cx="766" cy="130" r="2" />
      </g>
      <g class="bg__scene-shroom">
        <rect class="bg__scene-stem" x="900" y="132" width="11" height="20" rx="5" />
        <path class="bg__scene-cap" d="M887,134 q18,-23 36,0 Z" />
        <circle class="bg__scene-spot" cx="900" cy="126" r="2.4" />
        <circle class="bg__scene-spot" cx="911" cy="130" r="1.8" />
      </g>

      <g v-if="showGnome" class="bg__gnome">
        <g class="bg__gnome-scale" transform="translate(0 27) scale(0.82)">
        <g class="bg__gnome-bob">
          <rect class="bg__gnome-leg bg__gnome-leg--l" x="-8" y="138" width="7" height="14" rx="3" />
          <rect class="bg__gnome-leg bg__gnome-leg--r" x="1" y="138" width="7" height="14" rx="3" />
          <rect class="bg__gnome-arm bg__gnome-arm--l" x="-15" y="108" width="6" height="16" rx="3" />
          <rect class="bg__gnome-arm bg__gnome-arm--r" x="9" y="108" width="6" height="16" rx="3" />
          <path class="bg__gnome-body" d="M-13,140 L-10,110 Q0,102 10,110 L13,140 Z" />
          <circle class="bg__gnome-face" cx="0" cy="94" r="10" />
          <path class="bg__gnome-beard" d="M-10,95 Q0,128 10,95 Q5,104 0,104 Q-5,104 -10,95 Z" />
          <circle class="bg__gnome-nose" cx="0" cy="99" r="3.6" />
          <path class="bg__gnome-hat" d="M-13,90 C-8,58 3,46 18,56 C10,72 12,82 14,90 Z" />
          <circle class="bg__gnome-pom" cx="18" cy="55" r="3.8" />
        </g>
        </g>
      </g>
    </svg>

    <span class="bg__star bg__star--1"></span>
    <span class="bg__star bg__star--2"></span>
    <span class="bg__star bg__star--3"></span>
    <span class="bg__star bg__star--4"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import gsap from 'gsap'

import { ROUTE } from '@/constants/strings'

// Per-orb parallax depth (px of travel across the full viewport).
const ORB_DEPTH = [26, 40, 18, 52]

// Stations in scene viewBox units (width 1200, ground at y≈146).
const GNOME = {
  edgeStart: -110,
  edgeEnd: 1310,
  door: 600,
  mushrooms: [340, 770, 900],
  speed: 130
}

export default defineComponent({
  name: 'AnimatedBackground',
  data() {
    return {
      orbs: [] as HTMLElement[],
      pointerHandler: null as ((event: PointerEvent) => void) | null,
      reduceMotion: false,
      behaviorToken: 0,
      gnomeTween: null as gsap.core.Tween | null,
      resolveStep: null as (() => void) | null
    }
  },
  computed: {
    isHub(): boolean {
      return this.$route.name === ROUTE.HUB
    },
    showGnome(): boolean {
      return !this.reduceMotion
    }
  },
  watch: {
    isHub() {
      this.$nextTick(() => this.startGnome())
    }
  },
  mounted() {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!this.reduceMotion) {
      this.orbs = Array.from(this.$el.querySelectorAll('.bg__orb'))
      this.pointerHandler = (event: PointerEvent) => this.applyParallax(event)
      window.addEventListener('pointermove', this.pointerHandler, { passive: true })
    }
    this.$nextTick(() => this.startGnome())
  },
  beforeUnmount() {
    if (this.pointerHandler) window.removeEventListener('pointermove', this.pointerHandler)
    this.cancelGnome()
  },
  methods: {
    applyParallax(event: PointerEvent) {
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      this.orbs.forEach((orb, index) => {
        const depth = ORB_DEPTH[index % ORB_DEPTH.length]
        orb.style.translate = `${(-nx * depth).toFixed(1)}px ${(-ny * depth).toFixed(1)}px`
      })
    },
    gnomeEl(): SVGGElement | null {
      return (this.$el as HTMLElement)?.querySelector('.bg__gnome') ?? null
    },
    mushroomEls(): Element[] {
      return Array.from((this.$el as HTMLElement)?.querySelectorAll('.bg__scene-shroom') ?? [])
    },
    // Resolve when the animation finishes, or immediately on cancel.
    track(anim: gsap.core.Tween): Promise<void> {
      this.gnomeTween = anim
      return new Promise<void>((resolve) => {
        this.resolveStep = resolve
        anim.eventCallback('onComplete', resolve)
      })
    },
    cancelGnome() {
      this.behaviorToken += 1
      if (this.resolveStep) {
        this.resolveStep()
        this.resolveStep = null
      }
      if (this.gnomeTween) {
        this.gnomeTween.kill()
        this.gnomeTween = null
      }
    },
    startGnome() {
      this.cancelGnome()
      const el = this.gnomeEl()
      if (this.reduceMotion || !el) return
      gsap.killTweensOf(el)
      const token = this.behaviorToken
      if (this.isHub) void this.runHomeRoutine(token, el)
      else void this.runGameCameo(token, el)
    },
    alive(token: number): boolean {
      return token === this.behaviorToken
    },
    async walkTo(el: SVGGElement, x: number) {
      const from = Number(gsap.getProperty(el, 'x'))
      gsap.set(el, { scaleX: x < from ? -1 : 1 })
      el.classList.add('bg__gnome--walking')
      await this.track(gsap.to(el, { x, duration: Math.max(0.4, Math.abs(x - from) / GNOME.speed), ease: 'none' }))
      el.classList.remove('bg__gnome--walking')
    },
    async pause(seconds: number) {
      await this.track(gsap.delayedCall(seconds, () => {}))
    },
    async stoop(el: SVGGElement) {
      await this.track(gsap.to(el, { y: 9, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' }))
    },
    async runHomeRoutine(token: number, el: SVGGElement) {
      const shrooms = this.mushroomEls()
      gsap.set(shrooms, { opacity: 1 })
      gsap.set(el, { x: GNOME.edgeStart, y: 0, scaleX: 1, opacity: 1, transformOrigin: '0px 150px' })
      while (this.alive(token) && this.isHub) {
        const pick = Math.floor(Math.random() * GNOME.mushrooms.length)
        await this.walkTo(el, GNOME.mushrooms[pick])
        if (!this.alive(token)) return
        await this.pause(0.4)
        await this.stoop(el)
        gsap.to(shrooms[pick], { opacity: 0, duration: 0.25 })
        await this.pause(0.5)
        if (!this.alive(token)) return
        await this.walkTo(el, GNOME.door)
        if (!this.alive(token)) return
        await this.pause(0.3)
        await this.track(gsap.to(el, { opacity: 0, duration: 0.4 }))
        gsap.to(shrooms[pick], { opacity: 1, duration: 0.4, delay: 0.6 })
        await this.pause(1.8)
        if (!this.alive(token)) return
        gsap.set(el, { x: GNOME.door, scaleX: 1, opacity: 1 })
        await this.walkTo(el, GNOME.edgeEnd)
        if (!this.alive(token)) return
        gsap.set(el, { opacity: 0 })
        await this.pause(1.4)
        gsap.set(el, { x: GNOME.edgeStart, scaleX: 1, opacity: 1 })
      }
    },
    async runGameCameo(token: number, el: SVGGElement) {
      gsap.set(el, { opacity: 0, y: 0, transformOrigin: '0px 150px' })
      while (this.alive(token) && !this.isHub) {
        await this.pause(22 + Math.random() * 28)
        if (!this.alive(token) || this.isHub) return
        const fromLeft = Math.random() < 0.5
        const edge = fromLeft ? GNOME.edgeStart : GNOME.edgeEnd
        const peek = fromLeft ? edge + (180 + Math.random() * 220) : edge - (180 + Math.random() * 220)
        gsap.set(el, { x: edge, opacity: 1, scaleX: fromLeft ? 1 : -1 })
        await this.walkTo(el, peek)
        if (!this.alive(token)) return
        await this.track(gsap.to(el, { y: 7, duration: 0.26, yoyo: true, repeat: 3, ease: 'sine.inOut' }))
        await this.pause(0.4)
        await this.walkTo(el, edge)
        gsap.set(el, { opacity: 0 })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;

  &__sky {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120% 80% at 70% -10%, color-mix(in srgb, var(--color-sky) 38%, var(--color-bg)) 0%, transparent 60%),
      linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
  }

  &__orb {
    position: absolute;
    border-radius: var(--radius-pill);
    filter: blur(6px);
    opacity: var(--op-ghost);

    &--1 {
      inline-size: 320px;
      block-size: 320px;
      inset-block-start: -80px;
      inset-inline-end: -60px;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-sky) 70%, white), var(--color-sky));
      @include ambient(float, 9s);
    }

    &--2 {
      inline-size: 240px;
      block-size: 240px;
      inset-block-end: 6%;
      inset-inline-start: -50px;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-coral) 70%, white), var(--color-coral));
      @include ambient(drift, 12s);
    }

    &--3 {
      inline-size: 180px;
      block-size: 180px;
      inset-block-start: 32%;
      inset-inline-start: 14%;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-leaf) 70%, white), var(--color-leaf));
      @include ambient(float, 11s);
    }

    &--4 {
      inline-size: 150px;
      block-size: 150px;
      inset-block-start: 12%;
      inset-inline-start: 44%;
      background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-grape) 70%, white), var(--color-grape));
      @include ambient(drift, 10s);
    }
  }

  &__hill {
    position: absolute;
    inset-inline: -10%;
    border-start-start-radius: 50%;
    border-start-end-radius: 50%;

    &--far {
      inset-block-end: 0;
      block-size: 22%;
      background: color-mix(in srgb, var(--color-leaf) 40%, var(--color-bg-2));
    }

    &--near {
      inset-block-end: 0;
      block-size: 13%;
      background: color-mix(in srgb, var(--color-leaf) 60%, var(--color-bg-2));
    }
  }

  // Foreground village, one SVG so every object shares the same ground line.
  // Scales with viewport width (via the viewBox aspect ratio) so it shows the
  // same scene on phones and large screens, just smaller.
  &__scene {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    inline-size: 100%;
    block-size: auto;
    aspect-ratio: 1200 / 240;

    &-grass {
      fill: color-mix(in srgb, var(--color-leaf) 66%, var(--color-leaf-deep));
    }

    &-trunk {
      fill: color-mix(in srgb, var(--color-primary-deep) 48%, var(--color-ink));
    }

    &-canopy {
      transform-box: view-box;
      @include ambient(sway, 6s);
    }

    &-leaves {
      fill: var(--color-leaf-deep);

      &--hi {
        fill: color-mix(in srgb, var(--color-leaf) 55%, white);
      }
    }

    &-wall {
      fill: color-mix(in srgb, var(--color-sun) 32%, white);
    }

    &-roof {
      fill: var(--color-coral);
    }

    &-chimney {
      fill: var(--color-coral-deep);
    }

    &-window {
      fill: color-mix(in srgb, var(--color-sky) 45%, white);
    }

    &-window-bar {
      fill: none;
      stroke: color-mix(in srgb, var(--color-sun) 32%, white);
      stroke-width: 3;
    }

    &-door {
      fill: color-mix(in srgb, var(--color-grape) 58%, var(--color-ink));
    }

    &-knob {
      fill: var(--color-sun);
    }

    &-stem {
      fill: color-mix(in srgb, var(--color-sun) 20%, white);
    }

    &-cap {
      fill: var(--color-coral);
    }

    &-spot {
      fill: var(--color-white);
    }

    &-smoke {
      fill: color-mix(in srgb, white 82%, var(--color-bg-2));
      transform-box: fill-box;
      transform-origin: center;
      @include ambient(puff, 4s);

      &--2 {
        animation-delay: -2s;
      }
    }
  }

  // Position/opacity are driven by GSAP (see startGnome); the limbs only swing
  // while the gnome is walking, so it stands still during actions.
  &__gnome {
    &--walking {
      .bg__gnome-bob,
      .bg__gnome-leg,
      .bg__gnome-arm {
        animation-play-state: running;
      }
    }
  }

  &__gnome-bob {
    transform-box: fill-box;
    transform-origin: bottom center;
    @include ambient(waddle, 0.5s);
    animation-play-state: paused;
  }

  &__gnome-leg {
    fill: color-mix(in srgb, var(--color-ink) 42%, var(--color-grape));
    transform-box: fill-box;
    transform-origin: top center;
    @include ambient(step, 0.5s);
    animation-play-state: paused;

    &--r {
      animation-delay: -0.25s;
    }
  }

  &__gnome-arm {
    fill: var(--color-sky-deep);
    transform-box: fill-box;
    transform-origin: top center;
    @include ambient(step, 0.5s);
    animation-play-state: paused;

    &--l {
      animation-delay: -0.25s;
    }
  }

  &__gnome-body {
    fill: var(--color-sky-deep);
  }

  &__gnome-face {
    fill: color-mix(in srgb, var(--color-primary) 30%, white);
  }

  &__gnome-nose {
    fill: color-mix(in srgb, var(--color-primary) 45%, white);
  }

  &__gnome-beard {
    fill: color-mix(in srgb, white 90%, var(--color-sun));
  }

  &__gnome-hat {
    fill: var(--color-coral);
  }

  &__gnome-pom {
    fill: var(--color-white);
  }

  &__bubble {
    position: absolute;
    inline-size: 56px;
    block-size: 56px;
    border-radius: var(--radius-pill);
    opacity: 0;
    background: radial-gradient(
      circle at 30% 26%,
      color-mix(in srgb, white 85%, transparent) 0%,
      color-mix(in srgb, var(--bubble-tint) 32%, transparent) 52%,
      transparent 72%
    );
    box-shadow: inset 0 0 12px color-mix(in srgb, white 50%, transparent);
    @include decorative-from(600px);

    &--1 {
      --bubble-tint: var(--color-sky);
      inset-inline-start: 12%;
      inset-block-end: -70px;
      @include ambient(rise, 19s);
      animation-delay: -3s;
    }

    &--2 {
      --bubble-tint: var(--color-coral);
      inline-size: 40px;
      block-size: 40px;
      inset-inline-start: 30%;
      inset-block-end: -60px;
      @include ambient(rise, 24s);
      animation-delay: -11s;
    }

    &--3 {
      --bubble-tint: var(--color-leaf);
      inline-size: 72px;
      block-size: 72px;
      inset-inline-start: 52%;
      inset-block-end: -90px;
      @include ambient(rise, 22s);
      animation-delay: -7s;
    }

    &--4 {
      --bubble-tint: var(--color-grape);
      inline-size: 46px;
      block-size: 46px;
      inset-inline-end: 16%;
      inset-block-end: -64px;
      @include ambient(rise, 18s);
      animation-delay: -14s;
    }

    &--5 {
      --bubble-tint: var(--color-sun);
      inline-size: 34px;
      block-size: 34px;
      inset-inline-end: 34%;
      inset-block-end: -54px;
      @include ambient(rise, 26s);
      animation-delay: -5s;
    }

    &--6 {
      --bubble-tint: var(--color-sky);
      inline-size: 60px;
      block-size: 60px;
      inset-inline-start: 74%;
      inset-block-end: -80px;
      @include ambient(rise, 21s);
      animation-delay: -18s;
    }
  }

  &__star {
    position: absolute;
    inline-size: 26px;
    block-size: 26px;
    background: radial-gradient(circle at 50% 50%, var(--color-white), var(--color-sun) 70%);
    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
    opacity: var(--op-muted);
    @include decorative-from(900px);

    &--1 {
      inset-block-start: 18%;
      inset-inline-start: 24%;
      inline-size: 30px;
      block-size: 30px;
      @include ambient(twinkle, 4s);
    }

    &--2 {
      inset-block-start: 60%;
      inset-inline-end: 20%;
      @include ambient(twinkle, 5s);
    }

    &--3 {
      inset-block-start: 30%;
      inset-inline-end: 30%;
      inline-size: 20px;
      block-size: 20px;
      @include ambient(twinkle, 6s);
    }

    &--4 {
      inset-block-start: 74%;
      inset-inline-start: 16%;
      inline-size: 18px;
      block-size: 18px;
      @include ambient(twinkle, 5.5s);
    }
  }
}
</style>
