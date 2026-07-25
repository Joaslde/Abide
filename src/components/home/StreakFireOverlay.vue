<template>
  <teleport to="body">
    <transition name="fire-fade">
      <div v-if="visible" class="fire-overlay" @click="dismiss">
        <div ref="animBox" class="anim" />
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

const props = defineProps({
  count: { type: Number, default: 0 }
})

const { t } = useI18n()
const visible = ref(false)
const animBox = ref(null)
let anim = null

// Message d'encouragement selon le palier de streak.
const message = computed(() => {
  const n = props.count
  if (n >= 30) return t('streak.msg.month')
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
.anim {
  width: min(70vw, 300px);
  height: min(70vw, 300px);
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
