/**
 * Script : upload-version.js
 * Uploade une base de Bible générée (dist-bibles/) vers Cloudflare R2,
 * puis met à jour le manifeste public des versions téléchargeables.
 *
 * ⚠️ LOCAL UNIQUEMENT — utilise les clés secrètes R2 (.env.local).
 * Ces clés ne doivent JAMAIS être incluses dans l'app (cf. SECURITY.md).
 * L'app, elle, ne lit que le manifeste + les .db via URL PUBLIQUE.
 *
 * Usage :
 *   node scripts/upload-version.js kjv          (une version)
 *   node scripts/upload-version.js bsb rv1909   (plusieurs)
 *
 * L'argument est le nom du fichier sans « SQLite.db » (ex. darby_fr). Le nom
 * affiché et la langue sont lus DANS la base (table versions) : une seule source
 * de vérité, pas de liste à tenir à jour ici.
 *
 * Prérequis dans .env.local :
 *   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY,
 *   CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_BUCKET
 *   R2_PUBLIC_BASE_URL  (URL publique du bucket / custom domain, ex :
 *                        https://pub-xxxx.r2.dev  ou  https://cdn.abide.app)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Database from 'better-sqlite3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
dotenv.config({ path: join(ROOT, '.env.local') })

const {
  CLOUDFLARE_R2_ACCESS_KEY,
  CLOUDFLARE_R2_SECRET_KEY,
  CLOUDFLARE_R2_ENDPOINT,
  CLOUDFLARE_R2_BUCKET,
  R2_PUBLIC_BASE_URL
} = process.env

// Anciennes clés courtes conservées pour compatibilité.
const ALIASES = { darby: 'darby_fr', martin: 'martin_fr' }

/** Lit id, nom et langue directement dans la base générée. */
function readMeta(fileBase) {
  const file = `${fileBase}SQLite.db`
  const dbPath = join(ROOT, 'dist-bibles', file)
  if (!existsSync(dbPath)) return null
  const db = new Database(dbPath, { readonly: true })
  const row = db.prepare('SELECT id, name, language FROM versions LIMIT 1').get()
  db.close()
  return row ? { ...row, file, dbPath } : null
}

/**
 * Répare un texte encodé deux fois (UTF-8 relu comme Latin-1, ex. « FranÃ§ais »).
 * Bug constaté le 2026-11-07 sur les noms du manifeste publié.
 */
function fixMojibake(text) {
  if (typeof text !== 'string' || !/[ÃÂ]/.test(text)) return text
  const repaired = Buffer.from(text, 'latin1').toString('utf8')
  return repaired.includes('�') ? text : repaired
}

const MANIFEST_KEY = 'bibles/manifest.json'

function dbKey(file) {
  return `bibles/${file}`
}

function makeClient() {
  if (!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY) {
    console.error('❌ Clés R2 manquantes dans .env.local')
    process.exit(1)
  }
  return new S3Client({
    region: 'auto',
    endpoint: CLOUDFLARE_R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
      secretAccessKey: CLOUDFLARE_R2_SECRET_KEY
    }
  })
}

async function readManifest(client) {
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: CLOUDFLARE_R2_BUCKET, Key: MANIFEST_KEY })
    )
    const body = await res.Body.transformToString()
    return JSON.parse(body)
  } catch {
    // Pas encore de manifeste → on en crée un neuf.
    return { versions: [] }
  }
}

async function uploadOne(client, manifest, fileBase) {
  const meta = readMeta(ALIASES[fileBase] ?? fileBase)
  if (!meta) {
    console.error(`❌ Base introuvable pour "${fileBase}" dans dist-bibles/. Génère-la d'abord.`)
    process.exit(1)
  }
  const buf = readFileSync(meta.dbPath)
  const size = statSync(meta.dbPath).size

  console.log(`⬆️  ${meta.name} (${meta.id}, ${meta.language}) : ${(size / 1e6).toFixed(1)} Mo…`)
  await client.send(new PutObjectCommand({
    Bucket: CLOUDFLARE_R2_BUCKET,
    Key: dbKey(meta.file),
    Body: buf,
    ContentType: 'application/x-sqlite3'
  }))

  const publicUrl = `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${dbKey(meta.file)}`
  manifest.versions = [
    ...manifest.versions.filter((v) => v.id !== meta.id),
    { id: meta.id, name: meta.name, language: meta.language, url: publicUrl, size, updated_at: new Date().toISOString() }
  ]
}

async function main() {
  const keys = process.argv.slice(2)
  if (!keys.length) {
    console.error('Usage : node scripts/upload-version.js <fichier> [<fichier>…]  (ex. bsb rv1909)')
    process.exit(1)
  }
  if (!R2_PUBLIC_BASE_URL) {
    console.error('❌ R2_PUBLIC_BASE_URL manquant dans .env.local (URL publique du bucket).')
    process.exit(1)
  }

  const client = makeClient()
  const manifest = await readManifest(client)
  // Réparation des noms déjà abîmés par l'ancien bug d'encodage.
  manifest.versions = manifest.versions.map((v) => ({ ...v, name: fixMojibake(v.name) }))

  for (const key of keys) await uploadOne(client, manifest, key)

  await client.send(new PutObjectCommand({
    Bucket: CLOUDFLARE_R2_BUCKET,
    Key: MANIFEST_KEY,
    Body: Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'),
    ContentType: 'application/json; charset=utf-8'
  }))
  console.log(`
✅ ${keys.length} version(s) publiée(s), manifeste : ${manifest.versions.length} versions.`)
}

main().catch((e) => {
  console.error('❌ Échec upload :', e.message)
  process.exit(1)
})
