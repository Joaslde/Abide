<template>
  <!-- Contenu Markdown rendu + références bibliques rendues cliquables.
       Le HTML est TOUJOURS assaini (DOMPurify) avant insertion : il provient
       d'un LLM, donc traité comme hostile (SECURITY.md §6). -->
  <div ref="root" class="md" @click="onClick" v-html="html" />
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { splitByRefs } from '@/lib/bible-refs'

const props = defineProps({
  content: { type: String, required: true }
})
const emit = defineEmits(['openRef'])

const root = ref(null)

const md = new MarkdownIt({
  html: false, // le LLM n'a AUCUNE raison d'écrire du HTML → on l'interdit
  linkify: false,
  breaks: true // un retour à la ligne simple = <br> (naturel dans un chat)
})

/** Markdown → HTML, puis sanitisation stricte. */
const html = computed(() => {
  const raw = md.render(props.content ?? '')
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'del', 'blockquote',
      'ul', 'ol', 'li', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr'
    ],
    ALLOWED_ATTR: []
  })
})

/**
 * Après le rendu, on parcourt les nœuds TEXTE et on remplace les références
 * bibliques par des <button data-ref="…">. On ne touche jamais au HTML brut :
 * on manipule le DOM déjà assaini → aucune injection possible.
 */
function linkifyRefs() {
  const el = root.value
  if (!el) return
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const textNodes = []
  let n
  while ((n = walker.nextNode())) {
    // Ne pas toucher au contenu des blocs de code.
    if (n.parentElement?.closest('code, pre')) continue
    textNodes.push(n)
  }

  for (const node of textNodes) {
    const segments = splitByRefs(node.nodeValue)
    if (segments.length <= 1) continue // aucune référence trouvée

    const frag = document.createDocumentFragment()
    for (const seg of segments) {
      if (seg.type === 'text') {
        frag.appendChild(document.createTextNode(seg.value))
      } else {
        const btn = document.createElement('button')
        btn.className = 'inline-ref'
        btn.type = 'button'
        btn.textContent = seg.value
        btn.dataset.code = seg.code
        btn.dataset.chapter = String(seg.chapter)
        btn.dataset.verse = String(seg.verse)
        frag.appendChild(btn)
      }
    }
    node.parentNode.replaceChild(frag, node)
  }
}

/** Délégation : un seul listener pour tous les boutons de référence. */
function onClick(e) {
  const btn = e.target.closest?.('.inline-ref')
  if (!btn) return
  emit('openRef', {
    code: btn.dataset.code,
    chapter: Number(btn.dataset.chapter),
    verse: Number(btn.dataset.verse)
  })
}

onMounted(() => nextTick(linkifyRefs))
watch(html, () => nextTick(linkifyRefs))
</script>

<style scoped>
.md { font-size: 15px; line-height: 1.6; }

/* Le Markdown de l'IA : titres compacts, listes lisibles sur mobile. */
.md :deep(p) { margin: 0 0 0.7em; }
.md :deep(p:last-child) { margin-bottom: 0; }

.md :deep(h1),
.md :deep(h2),
.md :deep(h3),
.md :deep(h4) {
  font-family: var(--font-app);
  font-weight: 600;
  color: var(--gold);
  margin: 1em 0 0.4em;
  line-height: 1.3;
}
.md :deep(h1) { font-size: 1.15em; }
.md :deep(h2) { font-size: 1.1em; }
.md :deep(h3) { font-size: 1.05em; }
.md :deep(h4) { font-size: 1em; }
.md :deep(h1:first-child),
.md :deep(h2:first-child),
.md :deep(h3:first-child) { margin-top: 0; }

.md :deep(strong) { font-weight: 700; }
.md :deep(em) { font-style: italic; }

.md :deep(ul),
.md :deep(ol) { margin: 0 0 0.7em; padding-left: 1.3em; }
.md :deep(li) { margin-bottom: 0.3em; }
.md :deep(li:last-child) { margin-bottom: 0; }

.md :deep(blockquote) {
  margin: 0.6em 0;
  padding: 0.1em 0 0.1em 0.9em;
  border-left: 3px solid var(--gold-border-md);
  color: inherit;
  opacity: 0.92;
  font-style: italic;
}

.md :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.9em;
  padding: 1px 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}
.md :deep(pre) {
  margin: 0.6em 0;
  padding: 0.7em;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  overflow-x: auto;
}
.md :deep(hr) {
  border: none;
  border-top: 1px solid var(--gold-border);
  margin: 1em 0;
}

/* Référence biblique cliquable, DANS le texte (inline). */
.md :deep(.inline-ref) {
  display: inline;
  padding: 1px 5px;
  margin: 0 1px;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: 6px;
  color: var(--gold);
  font-family: inherit;
  font-size: 0.95em;
  font-weight: 600;
  line-height: inherit;
  cursor: pointer;
  /* Le texte de la référence ne doit pas être coupé en deux lignes. */
  white-space: nowrap;
}
.md :deep(.inline-ref:active) { background: var(--gold-border-md); }
</style>
