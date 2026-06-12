/**
 * Gestion des notifications push (FCM + APNs).
 * Initialisation et enregistrement du token en Phase 1.
 */
export function useNotifications() {
  async function requestPermission() {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const perm = await PushNotifications.requestPermissions()
    return perm.receive === 'granted'
  }

  async function register() {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.register()
  }

  return { requestPermission, register }
}
