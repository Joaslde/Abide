<template>
  <!-- Panneau d'actions qui sort du bas (style YouVersion).
       PAS de voile : l'écran derrière reste actif pour continuer à
       sélectionner/désélectionner d'autres versets pendant que le panneau est ouvert. -->
  <teleport to="body">
    <transition name="sheet">
      <div v-if="selection.hasSelection" class="action-sheet" role="dialog">
        <div class="sheet-handle" />

        <header class="sheet-head">
          <span class="sel-ref">{{ selection.reference }}</span>
          <button class="close-btn" :aria-label="t('common.close')" @click="selection.clear()">
            <ion-icon :icon="closeOutline" />
          </button>
        </header>

        <!-- Pastilles de couleur (highlight) -->
        <div class="colors">
          <button
            v-for="c in HIGHLIGHT_COLORS"
            :key="c.id"
            class="color-dot"
            :style="{ background: c.color }"
            :aria-label="c.id"
            @click="actions.highlight(c.color)"
          />
          <button class="color-dot clear" :aria-label="t('bible.actions.clearHighlight')" @click="actions.highlight(null)">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="act" @click="actions.copy()">
            <ion-icon :icon="copyOutline" />
            <span>{{ t('bible.actions.copy') }}</span>
          </button>
          <button class="act" @click="actions.save()">
            <ion-icon :icon="bookmarkOutline" />
            <span>{{ t('bible.actions.save') }}</span>
          </button>
          <button class="act" @click="actions.discussAI()">
            <ion-icon :icon="sparklesOutline" />
            <span>{{ t('bible.actions.ai') }}</span>
          </button>
          <button class="act" @click="actions.share()">
            <ion-icon :icon="shareOutline" />
            <span>{{ t('bible.actions.share') }}</span>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'
import {
  closeOutline, copyOutline, bookmarkOutline, sparklesOutline, shareOutline
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useVerseSelectionStore } from '@/stores/verseSelection'
import { useVerseActions, HIGHLIGHT_COLORS } from '@/composables/useVerseActions'

const { t } = useI18n()
const selection = useVerseSelectionStore()
const actions = useVerseActions()
</script>

<style scoped>
/* Panneau collé en bas, fixe (ne défile pas avec le texte). */
.action-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 41;
  background: var(--navy2);
  border-radius: 22px 22px 0 0;
  border-top: 1px solid var(--gold-border-md);
  padding: 0 var(--space-4)
           calc(env(safe-area-inset-bottom, 0px) + var(--space-4));
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35);
}

.sheet-handle {
  width: 38px;
  height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
  margin: 10px auto var(--space-3);
}

.sheet-head {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
}
.sel-ref {
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.02em;
}
.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 22px;
  display: flex;
  cursor: pointer;
}

/* Rangée de pastilles de couleur. */
.colors {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) 0 var(--space-4);
}
.color-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: transform var(--duration-fast);
  flex-shrink: 0;
}
.color-dot:active { transform: scale(0.88); }
.color-dot.clear {
  background: transparent;
  border: 1px dashed var(--gold-border-md);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* Actions (icône + libellé). */
.actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-1);
  border-top: 1px solid var(--gold-border);
  padding-top: var(--space-3);
}
.act {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: var(--space-2) 2px;
  background: none;
  border: none;
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 11px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--duration-fast);
}
.act:active { background: var(--card-bg); }
.act ion-icon { font-size: 24px; color: var(--gold); }

/* Transitions */
.sheet-enter-active, .sheet-leave-active {
  transition: transform var(--duration-normal) cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
