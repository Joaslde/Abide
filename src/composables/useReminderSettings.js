import { ref, onMounted, onUnmounted } from 'vue'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import {
  REMINDER_GROUPS, loadReminderSettings, saveReminderSettings, defaultReminderSettings
} from '@/lib/reminder-settings'
import { notificationPermissionState, rescheduleFromStores } from '@/lib/notifications'
import {
  isIgnoringBatteryOptimizations, requestIgnoreBatteryOptimizations, openNotificationSettings
} from '@/lib/battery-optimization'

/** Copie profonde (JSON : structuredClone manque sur les vieilles WebView). */
const clone = (v) => JSON.parse(JSON.stringify(v))

/**
 * Logique de l'écran Réglages → Notifications : lecture et enregistrement des
 * heures de rappel, puis replanification immédiate des notifications.
 */
export function useReminderSettings() {
  /** @type {import('vue').Ref<Record<string, {time: string, on: boolean}[]>|null>} */
  const settings = ref(null)
  const permission = ref('granted') // 'granted' | 'denied' | 'unsupported'
  const batteryOk = ref(true)

  async function refreshSystemState() {
    permission.value = await notificationPermissionState()
    batteryOk.value = await isIgnoringBatteryOptimizations()
  }

  async function load() {
    settings.value = clone(await loadReminderSettings())
    await refreshSystemState()
  }

  /**
   * Replanifie avec les nouvelles heures. L'empreinte des notifications
   * contient les réglages, donc la replanification passe le garde anti-spam ;
   * l'alerte de série est planifiée à part, par le store streak.
   */
  async function applyNow() {
    if (!Capacitor.isNativePlatform()) return
    await rescheduleFromStores()
    const { useStreakStore } = await import('@/stores/streak')
    await useStreakStore().load()
  }

  async function save(next) {
    settings.value = clone(await saveReminderSettings(next))
    await applyNow()
  }

  /** Change l'heure d'un rappel. */
  function setTime(group, index, time) {
    if (!time || !settings.value) return
    const next = clone(settings.value)
    next[group][index].time = time
    return save(next)
  }

  /** Active ou coupe un rappel. */
  function setEnabled(group, index, on) {
    if (!settings.value) return
    const next = clone(settings.value)
    next[group][index].on = on
    return save(next)
  }

  function resetDefaults() {
    return save(defaultReminderSettings())
  }

  async function allowBackground() {
    await requestIgnoreBatteryOptimizations()
  }

  // Retour depuis les réglages Android : l'état de la permission a pu changer.
  let resumeListener = null
  onMounted(async () => {
    await load()
    if (Capacitor.isNativePlatform()) {
      resumeListener = await App.addListener('resume', refreshSystemState)
    }
  })
  onUnmounted(() => resumeListener?.remove())

  return {
    groups: REMINDER_GROUPS,
    settings,
    permission,
    batteryOk,
    setTime,
    setEnabled,
    resetDefaults,
    allowBackground,
    openNotificationSettings
  }
}
