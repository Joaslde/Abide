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
 *   node scripts/upload-version.js kjv
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

// Métadonnées des versions (doivent matcher generate-version.js).
const META = {
  kjv:   { id: 'KJV',      file: 'kjvSQLite.db',      name: 'King James Version',      language: 'en' },
  web:   { id: 'WEB',      file: 'webSQLite.db',       name: 'World English Bible',     language: 'en' },
  asv:   { id: 'ASV',      file: 'asvSQLite.db',       name: 'American Standard Version', language: 'en' },
  darby: { id: 'DARBY_FR', file: 'darby_frSQLite.db', name: 'Darby (Français)',            language: 'fr' },
  ylt:   { id: 'YLT',     file: 'yltSQLite.db',      name: "Young's Literal Translation", language: 'en' },
  martin:{ id: 'MARTIN_FR',file: 'martin_frSQLite.db', name: 'Martin 1744 (Français)',   language: 'fr' }
  // Note : tyndale retiré (partiel sur getbible.net — NT uniquement). bbe/neg1979/nbs absents.
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

async function main() {
  const key = process.argv[2]
  const meta = META[key]
  if (!meta) {
    console.error(`Version inconnue : "${key}". Disponibles : ${Object.keys(META).join(', ')}`)
    process.exit(1)
  }
  if (!R2_PUBLIC_BASE_URL) {
    console.error('❌ R2_PUBLIC_BASE_URL manquant dans .env.local (URL publique du bucket).')
    console.error('   Active l\'accès public du bucket R2 et colle l\'URL (ex : https://pub-xxxx.r2.dev).')
    process.exit(1)
  }

  const dbPath = join(ROOT, 'dist-bibles', meta.file)
  if (!existsSync(dbPath)) {
    console.error(`❌ Fichier introuvable : ${dbPath}\n   Génère-le d'abord : node scripts/generate-version.js ${key}`)
    process.exit(1)
  }

  const client = makeClient()
  const buf = readFileSync(dbPath)
  const size = statSync(dbPath).size

  // 1. Upload du .db
  console.log(`⬆️  Upload ${meta.file} (${(size / 1e6).toFixed(1)} Mo) vers R2…`)
  await client.send(new PutObjectCommand({
    Bucket: CLOUDFLARE_R2_BUCKET,
    Key: dbKey(meta.file),
    Body: buf,
    ContentType: 'application/x-sqlite3'
  }))
  console.log('   ✓ .db uploadé')

  // 2. Mise à jour du manifeste
  const manifest = await readManifest(client)
  const publicUrl = `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${dbKey(meta.file)}`
  const entry = {
    id: meta.id,
    name: meta.name,
    language: meta.language,
    url: publicUrl,
    size,
    updated_at: new Date().toISOString()
  }
  manifest.versions = [
    ...manifest.versions.filter((v) => v.id !== meta.id),
    entry
  ]

  await client.send(new PutObjectCommand({
    Bucket: CLOUDFLARE_R2_BUCKET,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(manifest, null, 2),
    ContentType: 'application/json'
  }))
  console.log('   ✓ manifeste mis à jour')

  console.log(`\n✅ ${meta.name} disponible au téléchargement.`)
  console.log(`   .db       : ${publicUrl}`)
  console.log(`   manifeste : ${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${MANIFEST_KEY}`)
}

main().catch((e) => {
  console.error('❌ Échec upload :', e.message)
  process.exit(1)
})
