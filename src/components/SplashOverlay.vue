<template>
  <teleport to="body">
    <transition name="splash-fade">
      <div v-if="visible" class="splash" @click="dismiss">
        <div ref="animBox" class="splash-anim" />
        <p class="splash-msg">{{ message }}</p>
        <p class="splash-brand">Abide</p>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import lottie from 'lottie-web'
import { randomSplash } from '@/data/splashContent'

const { locale } = useI18n()
const visible = ref(true)
const animBox = ref(null)
const message = ref('')
let anim = null
let timer = null

onMounted(() => {
  const { animation, message: msg } = randomSplash(locale.value)
  message.value = msg
  if (animBox.value) {
    anim = lottie.loadAnimation({
      container: animBox.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animation
    })
  }
  // Auto-fermeture après ~2.6 s (skippable au tap).
  timer = setTimeout(dismiss, 2600)
})

function dismiss() {
  if (!visible.value) return
  visible.value = false
  clearTimeout(timer)
  if (anim) { anim.destroy(); anim = null }
}

onBeforeUnmount(() => {
  clearTimeout(timer)
  if (anim) anim.destroy()
})
</script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  background: radial-gradient(circle at 50% 40%, var(--navy2), var(--navy));
}
.splash-anim {
  width: min(64vw, 260px);
  height: min(64vw, 260px);
}
.splash-msg {
  font-family: var(--font-bible, var(--font-app));
  font-size: 17px;
  font-style: italic;
  line-height: 1.5;
  color: var(--cream);
  text-align: center;
  padding: 0 var(--space-8);
  margin: 0;
  max-width: 440px;
}
.splash-brand {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--space-8));
  font-family: var(--font-app);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--gold);
  margin: 0;
}

.splash-fade-enter-active, .splash-fade-leave-active { transition: opacity var(--duration-normal); }
.splash-fade-enter-from, .splash-fade-leave-to { opacity: 0; }
</style>
