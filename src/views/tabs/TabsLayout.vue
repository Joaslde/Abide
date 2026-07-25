<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>{{ t('home.tab') }}</ion-label>
        </ion-tab-button>
        <!-- 1er clic de la session sur l'onglet Bible → reprend le dernier
             chapitre lu (consumeResumePath). Les clics suivants = normal.
             La route interne reste /tabs/immersion (label = « Bible »). -->
        <ion-tab-button tab="immersion" href="/tabs/immersion" @click="onBibleTab">
          <ion-icon :icon="bookOutline" />
          <ion-label>{{ t('bible.title') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="ancre" href="/tabs/ancre">
          <ion-icon :icon="compassOutline" />
          <ion-label>L'Ancre</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="plus" href="/tabs/plus">
          <ion-icon :icon="ellipsisHorizontal" />
          <ion-label>{{ t('plus.tab') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonTabs, IonRouterOutlet, IonTabBar,
  IonTabButton, IonIcon, IonLabel
} from '@ionic/vue'
import {
  homeOutline, bookOutline, compassOutline, ellipsisHorizontal
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { consumeResumePath } from '@/router'

const { t } = useI18n()
const router = useRouter()

/** 1er clic sur l'onglet Bible → reprise du dernier chapitre lu. */
function onBibleTab() {
  const last = consumeResumePath()
  if (last && router.currentRoute.value.path !== last) {
    // nextTick léger : laisser Ionic traiter le clic d'onglet d'abord.
    setTimeout(() => router.push(last), 0)
  }
}
</script>
