<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plus" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">

        <!-- ── Carte profil (cliquable) ── -->
        <button v-if="auth.isAuthenticated" class="profile-card" @click="go('/settings/profile')">
          <div class="avatar">{{ auth.initials }}</div>
          <div class="profile-text">
            <span class="profile-name">{{ auth.fullName || t('settings.account') }}</span>
            <span class="profile-mail">{{ auth.user?.email }}</span>
          </div>
          <ion-icon class="chev" :icon="chevronForward" />
        </button>

        <button v-else class="profile-card" @click="go('/auth/login')">
          <div class="avatar guest"><ion-icon :icon="personOutline" /></div>
          <div class="profile-text">
            <span class="profile-name">{{ t('settings.signIn') }}</span>
            <span class="profile-mail">{{ t('settings.guestMode') }}</span>
          </div>
          <ion-icon class="chev" :icon="chevronForward" />
        </button>

        <!-- ── Bloc préférences ── -->
        <div class="group">
          <div class="item">
            <div class="item-lead">
              <ion-icon :icon="moonOutline" />
              <span>{{ t('settings.darkMode') }}</span>
            </div>
            <ion-toggle :checked="dark" @ionChange="onToggleDark($event)" />
          </div>

          <button class="item tappable" @click="go('/settings/language')">
            <div class="item-lead">
              <ion-icon :icon="languageOutline" />
              <span>{{ t('settings.language') }}</span>
            </div>
            <div class="item-trail">
              <span class="value">{{ prefs.locale === 'fr' ? t('settings.french') : t('settings.english') }}</span>
              <ion-icon class="chev" :icon="chevronForward" />
            </div>
          </button>
        </div>

        <!-- ── Bloc lecture Bible ── -->
        <div class="group">
          <button class="item tappable" @click="go('/settings/bible')">
            <div class="item-lead">
              <ion-icon :icon="bookOutline" />
              <span>{{ t('settings.bibleReading') }}</span>
            </div>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
        </div>

        <!-- ── Bloc parrainage (nécessite un compte) ── -->
        <div v-if="auth.isAuthenticated" class="group">
          <button class="item tappable" @click="go('/tabs/plus/referral')">
            <div class="item-lead">
              <ion-icon :icon="giftOutline" />
              <span>{{ t('settings.referral') }}</span>
            </div>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
        </div>

        <!-- ── Bloc infos / légal ── -->
        <div class="group">
          <button class="item tappable" @click="openLink('faq')">
            <div class="item-lead">
              <ion-icon :icon="helpCircleOutline" />
              <span>{{ t('settings.faq') }}</span>
            </div>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
          <button class="item tappable" @click="openLink('terms')">
            <div class="item-lead">
              <ion-icon :icon="documentTextOutline" />
              <span>{{ t('settings.terms') }}</span>
            </div>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
          <button class="item tappable" @click="openLink('privacy')">
            <div class="item-lead">
              <ion-icon :icon="shieldCheckmarkOutline" />
              <span>{{ t('settings.privacy') }}</span>
            </div>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
        </div>

        <p class="version">{{ t('settings.version') }} {{ appVersion }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton, IonToggle
} from '@ionic/vue'
import {
  chevronForward, personOutline, moonOutline, languageOutline,
  bookOutline, helpCircleOutline, documentTextOutline, shieldCheckmarkOutline,
  giftOutline
} from 'ionicons/icons'
import { Browser } from '@capacitor/browser'
import { usePreferencesStore } from '@/stores/preferences'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const prefs = usePreferencesStore()
const auth = useAuthStore()

const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
const dark = ref(prefs.isDarkNow())

function go(path) {
  router.push(path)
}

function onToggleDark(ev) {
  dark.value = ev.detail.checked
  prefs.toggleDark(dark.value)
}

// Landing statique (dossier landing/, déployée sur Vercel — cf. landing/README.md).
const LEGAL_URLS = {
  faq: 'https://toabide.online/faq.html',
  terms: 'https://toabide.online/terms.html',
  privacy: 'https://toabide.online/privacy.html'
}

/** Ouvre une page légale/FAQ dans le navigateur in-app (pas Safari/Chrome externe). */
async function openLink(key) {
  await Browser.open({ url: LEGAL_URLS[key] })
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4) var(--space-4) var(--space-10); }

/* ── Carte profil ── */
.profile-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.profile-card:active { border-color: var(--gold-border-md); }

.avatar {
  flex-shrink: 0;
  width: 52px; height: 52px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--gold2), var(--gold));
  color: var(--navy);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.02em;
}
.avatar.guest { background: var(--navy3); color: var(--muted); }
.avatar.guest ion-icon { font-size: 26px; }

.profile-text { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.profile-name {
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  color: var(--cream);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.profile-mail {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Blocs groupés (façon iOS) ── */
.group {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  overflow: hidden;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 54px;
  padding: 0 var(--space-4);
  background: transparent;
  border: none;
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  text-align: left;
}
/* Séparateur fin entre items d'un même bloc (sauf le dernier). */
.item + .item { border-top: 1px solid var(--gold-border); }
.tappable { cursor: pointer; }
.tappable:active { background: var(--navy2); }

.item-lead { display: flex; align-items: center; gap: var(--space-3); }
.item-lead ion-icon { font-size: 20px; color: var(--gold); }

.item-trail { display: flex; align-items: center; gap: var(--space-2); }
.value { font-size: 14px; color: var(--muted); }
.chev { font-size: 18px; color: var(--muted); }

ion-toggle {
  --track-background: var(--navy3);
  --track-background-checked: var(--gold);
  --handle-background: var(--cream);
  --handle-background-checked: var(--navy);
  padding: 0;
}

.version {
  text-align: center;
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--cream-50);
  margin-top: var(--space-6);
}
</style>
