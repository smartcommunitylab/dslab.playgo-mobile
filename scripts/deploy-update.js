require('dotenv').config();
const fs = require('fs');
const archiver = require('archiver');
const crypto = require('crypto');
const path = require('path');

// Configurazione
const FLAVOR = process.env.FLAVOR || 'production'; 
const PLATFORM = process.env.PLATFORM || 'android'; // android/ios
const BASE_URL = 'https://raw.githubusercontent.com/smartcommunitylab/dslab.playgo-mobile/capgo-test/updates';

// Path relativi alla root del progetto
const PROJECT_ROOT = path.join(__dirname, '..');
const UPDATES_DIR = path.join(PROJECT_ROOT, 'updates', FLAVOR, PLATFORM);
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'updates-manifest.json');

// Leggi versione
const packageJson = require('../package.json');
const VERSION = packageJson.version;
const APP_VERSION = process.env.APP_VERSION || VERSION; // Versione nativa minima richiesta

async function deploy() {
  console.log(`🚀 Deploying ${FLAVOR} v${VERSION} for ${PLATFORM}...`);
  console.log(`📱 Richiede App Nativa >= ${APP_VERSION}`);

  // 1. Crea cartella updates se non esiste
  if (!fs.existsSync(UPDATES_DIR)) {
    fs.mkdirSync(UPDATES_DIR, { recursive: true });
    console.log(`📁 Cartella creata: ${UPDATES_DIR}`);
  }

  // 2. Crea ZIP
  const zipName = `bundle_${FLAVOR}_${PLATFORM}_${VERSION}.zip`;
  const zipPath = path.join(UPDATES_DIR, zipName);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(output);
  archive.directory('www/', false);
  await archive.finalize();
  
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  console.log(`📦 ZIP creato: ${zipPath}`);

  // 3. Calcola Checksum
  const fileBuffer = fs.readFileSync(zipPath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const checksum = hashSum.digest('hex');
  console.log(`🔑 Checksum: ${checksum}`);

  // 4. Costruisci URL
  const url = `${BASE_URL}/${FLAVOR}/${PLATFORM}/${zipName}`;

  // 5. Leggi/Crea Manifest
  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  // 6. Aggiungi nuovo entry
  const newEntry = {
    version: VERSION,
    url: url,
    checksum: checksum,
    platform: PLATFORM,
    app_version: APP_VERSION,
    flavor: FLAVOR,
    timestamp: Date.now()
  };

  // Evita duplicati
  manifest = manifest.filter(e => 
    !(e.version === VERSION && e.platform === PLATFORM && e.flavor === FLAVOR)
  );
  
  manifest.unshift(newEntry); // Aggiungi in testa (più recenti prima)

  // 7. Salva Manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`📄 Manifest aggiornato: ${MANIFEST_PATH}`);

  // 8. Info finale
  console.log(`\n✅ Deploy completato!`);
  console.log(`📦 ZIP: ${zipPath}`);
  console.log(`🌐 URL: ${url}`);
  console.log(`\n⚠️  Prossimi passi:`);
  console.log(`   1. Verifica i file in: updates/${FLAVOR}/${PLATFORM}/`);
  console.log(`   2. Verifica ${MANIFEST_PATH}`);
  console.log(`   3. Committa e pusha su GitHub:`);
  console.log(`      git add updates/ updates-manifest.json`);
  console.log(`      git commit -m "chore: deploy v${VERSION} ${FLAVOR} ${PLATFORM}"`);
  console.log(`      git push`);
}

deploy().catch((e) => {
  console.error('❌ Deploy Failed:', e.message);
  process.exit(1);
});