<template>
  <ion-modal
    :is-open="open"
    @did-dismiss="$emit('close')"
    :initial-breakpoint="0.6"
    :breakpoints="[0, 0.6, 0.9]"
  >
    <div class="settings-sheet">
      <div class="sheet-handle" />
      <h2 class="sheet-title">{{ t('bible.readerSettings') }}</h2>

      <!-- Taille du texte -->
      <section class="block">
        <p class="block-label">{{ t('bible.fontSize') }}</p>
        <div class="size-row">
          <button class="size-btn" :disabled="prefs.bibleFontSize <= 16" @click="prefs.setBibleFontSize(prefs.bibleFontSize - 2)">A−</button>
          <span class="size-val">{{ prefs.bibleFontSize }}px</span>
          <button class="size-btn" :disabled="prefs.bibleFontSize >= 24" @click="prefs.setBibleFontSize(prefs.bibleFontSize + 2)">A+</button>
        </div>
      </section>

      <!-- Police -->
      <section class="block">
        <p class="block-label">{{ t('bible.font') }}</p>
        <div class="font-grid">
          <button
            v-for="f in prefs.BIBLE_FONTS"
            :key="f.id ?? 'default'"
            class="font-chip"
            :class="{ active: prefs.bibleFont === f.id }"
            :style="{ fontFamily: f.stack }"
            @click="prefs.setBibleFont(f.id)"
          >
            {{ f.label }}
          </button>
        </div>
      </section>

      <!-- Thème -->
      <section class="block">
        <p class="block-label">{{ t('bible.theme') }}</p>
        <div class="theme-row">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-chip"
            :class="{ active: prefs.theme === opt.value }"
            @click="prefs.setTheme(opt.value)"
          >
            <ion-icon :icon="opt.icon" />
            <span>{{ t(opt.label) }}</span>
          </button>
        </div>
      </section>
    </div>
  </ion-modal>
</template>

<script setup>
import { IonModal, IonIcon } from '@ionic/vue'
import { sunnyOutline, moonOutline, phonePortraitOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const prefs = usePreferencesStore()

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const themeOptions = [
  { value: 'system', label: 'bible.themeSystem', icon: phonePortraitOutline },
  { value: 'light', label: 'bible.themeLight', icon: sunnyOutline },
  { value: 'dark', label: 'bible.themeDark', icon: moonOutline }
]
</script>

<style scoped>
.settings-sheet {
  background: var(--navy2);
  padding: 0 var(--space-5) calc(env(safe-area-inset-bottom, 0px) + var(--space-6));
  height: 100%;
  overflow-y: auto;
}
.sheet-handle {
  width: 38px; height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
  margin: 10px auto var(--space-4);
}
.sheet-title {
  font-family: var(--font-app);
  font-size: 13px; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--gold);
  text-align: center;
  margin: 0 0 var(--space-5);
}

.block { margin-bottom: var(--space-6); }
.block-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--space-3);
}

/* Taille */
.size-row { display: flex; align-items: center; justify-content: center; gap: var(--space-6); }
.size-btn {
  width: 52px; height: 52px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 18px;
  cursor: pointer;
}
.size-btn:disabled { opacity: 0.4; }
.size-btn:active:not(:disabled) { border-color: var(--gold); }
.size-val { font-family: var(--font-app); font-size: 18px; color: var(--cream); min-width: 56px; text-align: center; }

/* Police */
.font-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
.font-chip {
  padding: var(--space-3);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-size: 16px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.font-chip.active { border-color: var(--gold); color: var(--gold); }

/* Thème */
.theme-row { display: flex; gap: var(--space-2); }
.theme-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--space-3);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 12px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.theme-chip.active { border-color: var(--gold); color: var(--gold); }
.theme-chip ion-icon { font-size: 22px; }
</style>
