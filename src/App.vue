<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialiser la session auth au démarrage
  await authStore.init()
  // Les plugins Capacitor natifs s'initialisent ici (Phase 1+)
})
</script>
