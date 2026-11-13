<template>
  <teleport to="body">
    <transition name="fire-fade">
      <div v-if="visible" class="fire-overlay" :class="{ blaze }" @click="dismiss">
        <div class="anim-stage">
          <!-- Série de 10 jours et plus : halo qui respire + braises qui montent. -->
          <template v-if="blaze">
            <div class="halo" />
            <span v-for="e in embers" :key="e.id" class="ember" :style="e.style" />
          </template>
          <div ref="animBox" class="anim" />
        </div>
        <p class="streak-count">{{ t('streak.days', { n: count }, count) }}</p>
        <p class="streak-msg">{{ message }}</p>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import lottie from 'lottie-web'
import fireData from '@/assets/lottie/fire.json'
import { STREAK_BLAZE_FROM } from '@/stores/streak'

const props = defineProps({
  count: { type: Number, default: 0 }
})

const { t } = useI18n()
const visible = ref(false)
const animBox = ref(null)
let anim = null

// À partir de 10 jours, la flamme s'embrase (plus grande, halo, braises).
const blaze = computed(() => props.count >= STREAK_BLAZE_FROM)

// Braises : positions et rythmes variés, fixés une fois pour toutes.
const embers = Array.from({ length: 14 }, (_, i) => {
  const x = ((i * 37) % 100) - 50 // répartition pseudo-aléatoire, stable
  return {
    id: i,
    style: {
      '--x': `${x * 1.6}px`,
      '--drift': `${(i % 2 ? 1 : -1) * (10 + (i * 7) % 25)}px`,
      '--size': `${3 + (i % 4)}px`,
      '--dur': `${1.6 + ((i * 13) % 10) / 10}s`,
      '--delay': `${((i * 17) % 14) / 10}s`
    }
  }
})

// Message d'encouragement selon le palier de streak.
const message = computed(() => {
  const n = props.count
  if (n >= 30) return t('streak.msg.month')
  if (n >= STREAK_BLAZE_FROM) return t('streak.msg.blaze')
  if (n >= 7) return t('streak.msg.week')
  if (n >= 3) return t('streak.msg.keep')
  return t('streak.msg.start')
})

/** Joue l'animation une fois puis se ferme. */
async function show() {
  visible.value = true
  await nextTick()
  if (!animBox.value) return
  anim = lottie.loadAnimation({
    container: animBox.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: fireData
  })
  anim.addEventListener('complete', () => {
    // Laisse le compteur visible un court instant après la flamme.
    setTimeout(dismiss, 900)
  })
}

function dismiss() {
  visible.value = false
  if (anim) {
    anim.destroy()
    anim = null
  }
}

defineExpose({ show })

onBeforeUnmount(() => {
  if (anim) anim.destroy()
})
</script>

<style scoped>
.fire-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: radial-gradient(circle at 50% 45%, rgba(30, 20, 10, 0.92), rgba(10, 14, 24, 0.97));
  backdrop-filter: blur(2px);
}
.anim-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.anim {
  position: relative;
  width: min(70vw, 300px);
  height: min(70vw, 300px);
}

/* ── Série de 10 jours et plus ── */
.blaze {
  background: radial-gradient(circle at 50% 42%, rgba(70, 30, 8, 0.94), rgba(10, 14, 24, 0.97));
}
.blaze .anim {
  width: min(92vw, 420px);
  height: min(92vw, 420px);
}
.halo {
  position: absolute;
  width: 78%;
  height: 78%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 150, 50, 0.45), rgba(255, 90, 30, 0.12) 55%, transparent 72%);
  animation: halo-breathe 1.6s ease-in-out infinite;
}
.ember {
  position: absolute;
  bottom: 30%;
  left: calc(50% + var(--x));
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: #FFC266;
  box-shadow: 0 0 8px 2px rgba(255, 140, 40, 0.8);
  opacity: 0;
  animation: ember-rise var(--dur) ease-out var(--delay) infinite;
}
.blaze .streak-count {
  font-size: 46px;
  background: linear-gradient(180deg, #FFE08A, #F2A23A 55%, #E0602A);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 0 14px rgba(240, 130, 40, 0.55));
}
@keyframes halo-breathe {
  0%, 100% { transform: scale(0.92); opacity: 0.75; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes ember-rise {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translate(var(--drift), -220px) scale(0.3); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .halo, .ember { animation: none; }
  .ember { display: none; }
}
.streak-count {
  font-family: var(--font-app);
  font-size: 34px;
  font-weight: 700;
  color: var(--gold);
  margin: 0;
  text-shadow: 0 0 18px rgba(201, 162, 39, 0.5);
}
.streak-msg {
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
  margin: 0;
  padding: 0 var(--space-8);
  text-align: center;
}

.fire-fade-enter-active, .fire-fade-leave-active { transition: opacity var(--duration-normal); }
.fire-fade-enter-from, .fire-fade-leave-to { opacity: 0; }
</style>
