<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.reminders.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <p class="intro">
          {{ auth.firstName
            ? t('settings.reminders.introNamed', { name: auth.firstName })
            : t('settings.reminders.intro') }}
        </p>

        <!-- Notifications coupées dans Android : l'app ne peut plus les
             redemander, seul l'utilisateur peut les rallumer. -->
        <div v-if="permission === 'denied'" class="notice">
          <p>{{ t('settings.reminders.denied') }}</p>
          <button class="notice-btn" @click="openNotificationSettings">
            {{ t('settings.reminders.openSystem') }}
          </button>
        </div>
        <div v-else-if="permission === 'unsupported'" class="notice">
          <p>{{ t('settings.reminders.webOnly') }}</p>
        </div>

        <!-- ROM agressives : sans exemption batterie, les rappels n'arrivent
             pas quand l'app est fermée (cf. lib/battery-optimization.js). -->
        <div v-if="!batteryOk" class="notice">
          <p class="notice-title">{{ t('settings.batteryTitle') }}</p>
          <p>{{ t('settings.batteryMsg') }}</p>
          <button class="notice-btn" @click="allowBackground">{{ t('settings.batteryAllow') }}</button>
        </div>

        <template v-if="settings">
          <section v-for="g in groups" :key="g">
            <h3 class="group-title">{{ t(`settings.reminders.groups.${g}`) }}</h3>
            <div class="group">
              <div v-for="(r, i) in settings[g]" :key="`${g}-${i}`" class="item">
                <span class="item-label" :class="{ off: !r.on }">
                  {{ t(`settings.reminders.slots.${g}.s${i}`) }}
                </span>
                <div class="item-trail">
                  <!-- Champ natif : ouvre le sélecteur d'heure du téléphone
                       (format 12 h / 24 h selon ses réglages). -->
                  <input
                    type="time"
                    class="time-input"
                    :value="r.time"
                    :disabled="!r.on"
                    :aria-label="t('settings.reminders.timeLabel', { slot: t(`settings.reminders.slots.${g}.s${i}`) })"
                    @change="onTime(g, i, $event)"
                  />
                  <ion-toggle
                    :checked="r.on"
                    :aria-label="t(`settings.reminders.slots.${g}.s${i}`)"
                    @ionChange="onToggle(g, i, $event)"
                  />
                </div>
              </div>
            </div>
            <p class="hint">{{ t(`settings.reminders.hints.${g}`) }}</p>
          </section>

          <button class="reset" @click="onReset">{{ t('settings.reminders.reset') }}</button>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonToggle, toastController
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useReminderSettings } from '@/composables/useReminderSettings'

const { t } = useI18n()
const auth = useAuthStore()
const {
  groups, settings, permission, batteryOk,
  setTime, setEnabled, resetDefaults, allowBackground, openNotificationSettings
} = useReminderSettings()

async function confirmSaved() {
  const toast = await toastController.create({
    message: t('settings.reminders.saved'),
    duration: 1400,
    position: 'top'
  })
  await toast.present()
}

async function onTime(group, index, ev) {
  const value = ev.target.value
  if (!value || value === settings.value?.[group]?.[index]?.time) return
  await setTime(group, index, value)
  await confirmSaved()
}

async function onToggle(group, index, ev) {
  const on = ev.detail.checked
  if (on === settings.value?.[group]?.[index]?.on) return
  await setEnabled(group, index, on)
  await confirmSaved()
}

async function onReset() {
  await resetDefaults()
  await confirmSaved()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }
.wrap { padding: var(--space-4) var(--space-4) var(--space-10); }

.intro {
  font-family: var(--font-app);
  font-size: 15px;
  line-height: 1.5;
  color: var(--cream);
  margin: 0 0 var(--space-5);
}

.notice {
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.5;
  color: var(--cream);
}
.notice p { margin: 0 0 var(--space-3); }
.notice p:last-child { margin-bottom: 0; }
.notice-title { font-weight: 600; color: var(--gold); }
.notice-btn {
  background: var(--gold);
  color: var(--navy);
  border: none;
  border-radius: var(--radius-full);
  padding: 8px 18px;
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.group-title {
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold);
  margin: var(--space-5) var(--space-1) var(--space-2);
}

/* Blocs groupés : même matière que l'écran Réglages. */
.group {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 56px;
  padding: 0 var(--space-4);
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
}
.item + .item { border-top: 1px solid var(--gold-border); }
.item-label { min-width: 0; }
.item-label.off { color: var(--muted); }
.item-trail { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }

.time-input {
  background: var(--navy2);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-sm);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 6px 10px;
}
.time-input:disabled { opacity: 0.4; }

ion-toggle {
  --track-background: var(--navy3);
  --track-background-checked: var(--gold);
  --handle-background: var(--cream);
  --handle-background-checked: var(--navy);
  padding: 0;
}

.hint {
  font-family: var(--font-app);
  font-size: 13px;
  line-height: 1.45;
  color: var(--muted);
  margin: var(--space-2) var(--space-1) 0;
}

.reset {
  display: block;
  margin: var(--space-8) auto 0;
  background: none;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  padding: 10px 20px;
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
</style>
