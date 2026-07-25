<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.manageTitle') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <section class="block">
        <p class="block-label danger-label">{{ t('settings.dangerZone') }}</p>

        <!-- Étape 1 : le bouton n'ouvre que le formulaire de confirmation. -->
        <button v-if="!confirming" class="list-item danger" @click="confirming = true">
          <span>{{ t('settings.deleteAccount') }}</span>
          <ion-icon :icon="trashOutline" />
        </button>

        <!-- Étape 2 : avertissement détaillé + recopie d'un mot exact. -->
        <div v-else class="delete-panel">
          <h2 class="delete-title">{{ t('settings.deleteTitle') }}</h2>
          <p class="delete-warning">{{ t('settings.deleteWarning') }}</p>
          <ul class="delete-list">
            <li>{{ t('settings.deleteItem1') }}</li>
            <li>{{ t('settings.deleteItem2') }}</li>
            <li>{{ t('settings.deleteItem3') }}</li>
            <li>{{ t('settings.deleteItem4') }}</li>
          </ul>

          <p class="confirm-hint">{{ t('settings.deleteConfirmHint', { word: confirmWord }) }}</p>
          <input
            v-model="typed"
            class="confirm-input"
            :placeholder="t('settings.deletePlaceholder', { word: confirmWord })"
            autocapitalize="characters"
            autocomplete="off"
            spellcheck="false"
          />

          <p v-if="error" class="error-msg">{{ t('settings.deleteError') }}</p>

          <button
            class="delete-btn"
            :disabled="typed.trim() !== confirmWord || loading"
            @click="doDelete"
          >
            {{ loading ? t('settings.deleting') : t('settings.deleteButton') }}
          </button>
          <button class="cancel-btn" :disabled="loading" @click="cancel">
            {{ t('settings.cancel') }}
          </button>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toastController } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton
} from '@ionic/vue'
import { trashOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const confirming = ref(false)
const typed = ref('')
const loading = ref(false)
const error = ref(false)

// Le mot à recopier suit la langue (SUPPRIMER / DELETE).
const confirmWord = computed(() => t('settings.deleteConfirmWord'))

function cancel() {
  confirming.value = false
  typed.value = ''
  error.value = false
}

async function doDelete() {
  if (typed.value.trim() !== confirmWord.value || loading.value) return
  loading.value = true
  error.value = false
  try {
    await auth.deleteAccount()
    const toast = await toastController.create({
      message: t('settings.deleteSuccess'),
      duration: 3000,
      position: 'top'
    })
    await toast.present()
    router.replace('/tabs/home')
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.block { padding: var(--space-5) var(--space-4); }
.block-label {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 var(--space-3);
}
.danger-label { color: var(--color-error); }

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 50px;
  background: transparent;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: 0 var(--space-4);
  color: var(--color-error);
  font-family: var(--font-app);
  font-size: 15px;
  cursor: pointer;
}
.list-item ion-icon { font-size: 18px; }

.delete-panel {
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  background: rgba(192, 64, 64, 0.06);
}
.delete-title {
  font-family: var(--font-app);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-error);
  margin: 0 0 var(--space-3);
}
.delete-warning {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--cream);
  margin: 0 0 var(--space-2);
}
.delete-list {
  margin: 0 0 var(--space-4);
  padding-left: var(--space-5);
}
.delete-list li {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--cream-70);
  margin-bottom: 4px;
}

.confirm-hint {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--cream);
  margin: 0 0 var(--space-2);
}
.confirm-input {
  width: 100%;
  background: var(--navy2);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-4);
}
.confirm-input:focus {
  outline: none;
  border-color: var(--gold);
}

.error-msg {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--color-error);
  margin: 0 0 var(--space-3);
}

.delete-btn {
  width: 100%;
  min-height: 48px;
  background: var(--color-error);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sharp);
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  margin-bottom: var(--space-3);
}
.delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cancel-btn {
  width: 100%;
  min-height: 44px;
  background: transparent;
  color: var(--muted);
  border: none;
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
</style>
