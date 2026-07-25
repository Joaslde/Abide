<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.profileTitle') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">

        <!-- En-tête : avatar + nom + membre depuis -->
        <div class="head">
          <div class="avatar">{{ auth.initials }}</div>
          <span class="name">{{ auth.fullName || t('settings.account') }}</span>
          <span v-if="memberSince" class="since">{{ t('settings.memberSince', { date: memberSince }) }}</span>
        </div>

        <!-- Informations identitaires (celles qu'on a réussi à récolter) -->
        <p class="group-label">{{ t('settings.myInfo') }}</p>
        <div class="group">
          <div v-for="row in infoRows" :key="row.label" class="item">
            <span class="item-label">{{ row.label }}</span>
            <span class="item-value">{{ row.value }}</span>
          </div>
        </div>

        <!-- Actions de compte -->
        <div class="group">
          <button class="item tappable" @click="go('/auth/forgot')">
            <span class="action">{{ t('settings.changePassword') }}</span>
            <ion-icon class="chev" :icon="chevronForward" />
          </button>
          <button class="item tappable" @click="confirmLogout">
            <span class="action">{{ t('settings.logout') }}</span>
            <ion-icon :icon="logOutOutline" />
          </button>
        </div>

        <!-- Zone sensible : suppression (garde sa barrière sur la sous-page) -->
        <div class="group danger-group">
          <button class="item tappable" @click="go('/settings/account')">
            <span class="action danger">{{ t('settings.deleteAccount') }}</span>
            <ion-icon class="danger" :icon="trashOutline" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { alertController } from '@ionic/vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton
} from '@ionic/vue'
import { chevronForward, logOutOutline, trashOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'

const { t, te } = useI18n()
const router = useRouter()
const auth = useAuthStore()

/** Traduit une valeur onboarding via une clé i18n si elle existe, sinon la valeur brute. */
function labelOr(key, raw) {
  return raw && te(key) ? t(key) : raw
}

const memberSince = computed(() => {
  const iso = auth.profile?.created_at
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(auth.profile?.preferred_lang || undefined, {
    year: 'numeric', month: 'long'
  })
})

/** Lignes d'info : uniquement celles réellement présentes dans le profil. */
const infoRows = computed(() => {
  const p = auth.profile || {}
  const rows = []
  const push = (label, value) => { if (value) rows.push({ label, value }) }

  push(t('settings.fieldName'), auth.fullName)
  push(t('settings.fieldEmail'), auth.user?.email)
  push(t('settings.fieldProfile'), labelOr(`onboarding.profiles.${p.user_profile}.name`, p.user_profile))
  push(t('settings.fieldLevel'), labelOr(`onboarding.levels.${p.bible_level}`, p.bible_level))
  push(t('settings.fieldChurch'), p.church_name)
  push(t('settings.fieldDenomination'), p.church_denomination)
  push(t('settings.fieldLocation'), [p.city, p.country].filter(Boolean).join(', '))
  return rows
})

function go(path) {
  router.push(path)
}

async function confirmLogout() {
  const alert = await alertController.create({
    message: t('settings.logoutConfirm'),
    buttons: [
      { text: t('settings.cancel'), role: 'cancel' },
      {
        text: t('settings.logout'),
        role: 'destructive',
        handler: async () => {
          await auth.logout()
          router.replace('/tabs/home')
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4) var(--space-4) var(--space-10); }

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) 0 var(--space-6);
}
.avatar {
  width: 76px; height: 76px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--gold2), var(--gold));
  color: var(--navy);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 28px;
  box-shadow: 0 6px 24px rgba(201, 168, 76, 0.28);
}
.name {
  font-family: var(--font-app);
  font-size: 20px;
  font-weight: 600;
  color: var(--cream);
}
.since {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
}

.group-label {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-3) 4px;
}
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
  gap: var(--space-4);
  width: 100%;
  min-height: 52px;
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
}
.item + .item { border-top: 1px solid var(--gold-border); }
.tappable { cursor: pointer; }
.tappable:active { background: var(--navy2); }

.item-label {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--muted);
  flex-shrink: 0;
}
.item-value {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--cream);
  text-align: right;
}
.action {
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
}
.chev { font-size: 18px; color: var(--muted); }
.item ion-icon { color: var(--muted); font-size: 18px; }

.danger, .danger-group .item ion-icon { color: var(--color-error) !important; }
.danger-group { border-color: rgba(192, 64, 64, 0.35); }
</style>
