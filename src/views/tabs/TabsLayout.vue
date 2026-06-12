<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="immersion" href="/tabs/immersion">
          <ion-icon name="book-outline" />
          <ion-label>Immersion</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="sanctuaire" href="/tabs/sanctuaire">
          <ion-icon name="heart-outline" />
          <ion-label>Sanctuaire</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="ancre" href="/tabs/ancre">
          <ion-icon name="sparkles-outline" />
          <ion-label>L'Ancre</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="phare" href="/tabs/phare">
          <ion-icon name="flame-outline" />
          <ion-label>Le Phare</ion-label>
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
</script>
