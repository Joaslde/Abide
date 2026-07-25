<template>
  <!-- Carte « moment de prière » de l'Accueil : matin avant 18h, soir ensuite.
       Ouvre le déroulé guidé du Sanctuaire. -->
  <button class="pcard" @click="open">
    <div class="pico">
      <ion-icon :icon="type === 'morning' ? sunnyOutline : moonOutline" />
    </div>
    <div class="pmain">
      <span class="ptitle">{{ t(`sanctuaire.moment.${type}Title`) }}</span>
      <span class="phint">
        {{ done ? t('sanctuaire.moment.doneHint') : t(`sanctuaire.moment.${type}Hint`) }}
      </span>
    </div>
    <ion-icon v-if="done" :icon="checkmarkCircle" class="pdone" />
    <ion-icon v-else :icon="chevronForward" class="pchev" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonIcon } from '@ionic/vue'
import { sunnyOutline, moonOutline, checkmarkCircle, chevronForward } from 'ionicons/icons'
import { usePrayerStore } from '@/stores/prayer'

const { t } = useI18n()
const router = useRouter()
const prayer = usePrayerStore()

const type = computed(() => (new Date().getHours() < 18 ? 'morning' : 'evening'))
const done = computed(() => prayer.momentDoneToday(type.value))

function open() {
  router.push(`/tabs/sanctuaire/moment?type=${type.value}`)
}
</script>

<style scoped>
.pcard {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
}
.pcard:active { border-color: var(--gold-border-md); }

.pico {
  width: 38px; height: 38px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--gold-border);
  border-radius: 50%;
}
.pico ion-icon { font-size: 19px; color: var(--gold); }

.pmain { display: flex; flex-direction: column; min-width: 0; }
.ptitle {
  font-family: var(--font-app);
  font-size: 14px; font-weight: 600;
  color: var(--cream);
}
.phint {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pdone { margin-left: auto; font-size: 20px; color: var(--gold); flex-shrink: 0; }
.pchev { margin-left: auto; font-size: 16px; color: var(--muted); flex-shrink: 0; }
</style>
