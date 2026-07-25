import { Capacitor } from '@capacitor/core'
import { Clipboard } from '@capacitor/clipboard'
import { Share } from '@capacitor/share'
import { toastController } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useVerseSelectionStore } from '@/stores/verseSelection'
import { useUserDataStore } from '@/stores/userData'

/**
 * Actions applicables à la sélection de versets : copier, surligner (persisté),
 * partager (natif), discuter avec le Guide IA.
 */
export function useVerseActions() {
  const { t } = useI18n()
  const router = useRouter()
  const selection = useVerseSelectionStore()
  const userData = useUserDataStore()

  async function toast(message) {
    const tt = await toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
      color: 'dark'
    })
    await tt.present()
  }

  /**
   * Construit le texte à copier : les versets (numérotés) entre guillemets,
   * suivis de la référence et de la version.
   * Ex : « ¹ Au commencement… ² … » — Genèse 1:1-2 (LSG 1910)
   */
  function buildCopyText() {
    const sel = selection
    const lines = sel.sortedVerses.map((n) => `${n}. ${sel.selected.get(n)}`)
    const versionLabel =
      sel.context?.versionId === 'LSG1910' ? 'LSG 1910' : (sel.context?.versionId ?? '')
    return `« ${lines.join('\n')} »\n— ${sel.reference} (${versionLabel})`
  }

  /** Copie la sélection dans le presse-papier (natif via Capacitor). */
  async function copy() {
    if (!selection.hasSelection) return
    try {
      await Clipboard.write({ string: buildCopyText() })
      await toast(t('bible.actions.copied'))
    } catch {
      await toast(t('bible.actions.copyError'))
    }
    selection.clear()
  }

  /**
   * Surligne la sélection avec une couleur (ou l'efface si color=null).
   * PERSISTÉ en SQLite local via userData. Le contexte + les versets sont
   * capturés AVANT clear() (qui remet le contexte à null).
   * @param {string|null} color  couleur CSS, ou null pour effacer
   */
  async function highlight(color) {
    if (!selection.hasSelection) return
    const ctx = { ...selection.context }
    const verses = selection.sortedVerses.map((n) => ({
      verse: n,
      text: selection.selected.get(n)
    }))
    selection.clear()
    await userData.applyHighlight(ctx, verses, color)
  }

  /** Partage la sélection via la feuille de partage native (WhatsApp, etc.). */
  async function share() {
    if (!selection.hasSelection) return
    const text = buildCopyText()
    const title = selection.reference
    selection.clear()
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title, text, dialogTitle: title })
      } else if (navigator.share) {
        await navigator.share({ title, text })
      } else {
        // Repli web sans Web Share API : copie + toast.
        await Clipboard.write({ string: text })
        await toast(t('bible.actions.copied'))
      }
    } catch {
      /* l'utilisateur a annulé le partage — rien à signaler */
    }
  }

  /**
   * « Sauvegarder » = surligner avec la couleur PAR DÉFAUT (jaune), sans que
   * l'utilisateur ait à choisir une couleur. Équivalent d'un surlignage rapide.
   */
  async function save() {
    await highlight(DEFAULT_HIGHLIGHT)
    await toast(t('bible.actions.saved'))
  }

  /**
   * « Guide IA » : ouvre L'Ancre sur une NOUVELLE discussion, avec les versets
   * sélectionnés déjà préremplis dans le champ de saisie (l'utilisateur complète
   * sa question avant d'envoyer).
   */
  async function discussAI() {
    if (!selection.hasSelection) return
    const text = buildCopyText()
    selection.clear()
    // ?prefill= : AncreTab démarre une discussion vierge et remplit le champ.
    router.push({ path: '/tabs/ancre', query: { prefill: text } })
  }

  return { copy, highlight, save, discussAI, share }
}

/**
 * Palette de surlignage (style YouVersion, adaptée à la charte navy/gold).
 * `id` sert de clé stable (future persistance), `color` est la couleur de fond.
 * Le dernier item (clear) efface le surlignage.
 */
/** Couleur de surlignage par défaut (bouton « Sauvegarder »). */
export const DEFAULT_HIGHLIGHT = '#E6C84F'

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', color: '#E6C84F' },
  { id: 'gold', color: '#C9A227' },
  { id: 'green', color: '#5FA86B' },
  { id: 'blue', color: '#4E86C4' },
  { id: 'pink', color: '#C77DA6' },
  { id: 'purple', color: '#9B7FD0' },
  { id: 'orange', color: '#D98A4E' }
]
