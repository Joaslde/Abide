<template>
  <!-- Badge « Abide Plus » : visible seulement pour un abonné actif (statut
       serveur, voir auth.isPremium). Un appui ouvre l'écran Abide Plus. -->
  <button
    v-if="auth.isPremium"
    class="plus-badge"
    type="button"
    :aria-label="t('premium.badgeLabel')"
    @click="router.push('/premium')"
  >
    <span class="pill">
      <ion-icon :icon="sparkles" aria-hidden="true" />
      {{ t('premium.title') }}
    </span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonIcon } from '@ionic/vue'
import { sparkles } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
</script>

<style scoped>
/* Bouton transparent de 44 px de haut (taille tactile minimale), la pastille
   visible reste petite et discrète. */
.plus-badge {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--space-2);
  background: transparent;
  border: none;
  cursor: pointer;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: var(--radius-sharp);
  background: var(--gold);
  /* --on-gold : texte sombre FIXE, lisible sur l'or dans les deux thèmes. */
  color: var(--on-gold);
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
}
.pill ion-icon { font-size: 12px; }
.plus-badge:active .pill { background: var(--gold2); }
</style>
