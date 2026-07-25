<template>
  <ion-modal
    :is-open="open"
    @did-dismiss="$emit('close')"
    :initial-breakpoint="0.5"
    :breakpoints="[0, 0.5, 0.85]"
    class="version-sheet"
  >
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h2 class="sheet-title">{{ t('bible.downloadedVersions') }}</h2>

      <ul class="version-list">
        <li
          v-for="v in versions"
          :key="v.id"
          class="version-item"
          :class="{ active: v.id === activeVersion }"
          @click="select(v.id)"
        >
          <div class="v-info">
            <span class="v-name">{{ v.name }}</span>
            <span class="v-lang">{{ v.language?.toUpperCase() }}</span>
          </div>
          <ion-icon v-if="v.id === activeVersion" :icon="checkmark" class="v-check" />
        </li>
      </ul>

      <button class="add-version" @click="addVersion">
        <ion-icon :icon="add" />
        <span>{{ t('bible.addVersion') }}</span>
      </button>
    </div>
  </ion-modal>
</template>

<script setup>
import { IonModal, IonIcon } from '@ionic/vue'
import { checkmark, add } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  open: { type: Boolean, default: false },
  versions: { type: Array, default: () => [] },
  activeVersion: { type: String, default: '' }
})

const emit = defineEmits(['close', 'select', 'add'])

function select(id) {
  emit('select', id)
  emit('close')
}

function addVersion() {
  emit('add')
}
</script>

<style scoped>
.version-sheet {
  --background: var(--navy2);
  --border-radius: 24px 24px 0 0;
}
.sheet {
  background: var(--navy2);
  padding: 0 var(--space-5) calc(env(safe-area-inset-bottom, 0px) + var(--space-6));
  min-height: 100%;
}
.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
  margin: 12px auto var(--space-5);
}
.sheet-title {
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-4);
}
.version-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--duration-fast), border-color var(--duration-fast);
}
.version-item:active { background: var(--card-bg); }
.version-item.active {
  border-color: var(--gold-border-md);
  background: var(--card-bg);
}
.v-info { display: flex; flex-direction: column; gap: 2px; }
.v-name {
  font-family: var(--font-app);
  font-size: 16px;
  color: var(--cream);
}
.v-lang {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.v-check { color: var(--gold); font-size: 20px; }

.add-version {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: none;
  border: 1px dashed var(--gold-border-md);
  border-radius: var(--radius-md);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 15px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.add-version:active { border-color: var(--gold); }
.add-version ion-icon { font-size: 20px; }
</style>
