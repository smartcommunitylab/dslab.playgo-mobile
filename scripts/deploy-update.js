require('dotenv').config();
const fs = require('fs');
const archiver = require('archiver');
const crypto = require('crypto');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

// Configurazione
const FLAVOR = process.env.FLAVOR || 'production'; 
const PLATFORM = process.env.PLATFORM || 'android';
const AZURE_SAS_URL = process.env.AZURE_SAS_URL;
const BASE_URL = 'https://playngohcstorageaccount.blob.core.windows.net/hotcode';

if (!AZURE_SAS_URL) {
  throw new Error('❌ AZURE_SAS_URL non configurata nel .env');
}

// Estrai il container name dal SAS URL
function getContainerFromSasUrl(sasUrl) {
  try {
    const url = new URL(sasUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    return pathParts.length > 0 ? pathParts[0] : null;
  } catch {
    return null;
  }
}

const CONTAINER_NAME = getContainerFromSasUrl(AZURE_SAS_URL) || 'hotcode';

// Path relativi alla root del progetto
const PROJECT_ROOT = path.join(__dirname, '..');
const TEMP_DIR = path.join(PROJECT_ROOT, 'temp');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'updates-manifest.json');

// Leggi versione
const packageJson = require('../package.json');
const VERSION = packageJson.version;
const APP_VERSION = process.env.APP_VERSION || VERSION;

async function uploadToAzure(filePath, blobName) {
  // Crea BlobServiceClient dalla base URL (senza container)
  const baseUrl = AZURE_SAS_URL.split('?')[0].replace(`/${CONTAINER_NAME}`, '');
  const sasToken = AZURE_SAS_URL.split('?')[1];
  const blobServiceClient = new BlobServiceClient(`${baseUrl}?${sasToken}`);
  
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  console.log(`📤 Upload in corso: ${blobName}...`);
  
  try {
    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: {
        blobContentType: blobName.endsWith('.json') ? 'application/json' : 'application/zip'
      }
    });
    
    // Costruisci URL pubblico (senza SAS token)
    const publicUrl = `${BASE_URL}/${blobName}`;
    console.log(`✅ Upload completato: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Errore upload ${blobName}:`, error.message);
    throw error;
  }
}

async function deploy() {
  console.log(`🚀 Deploying ${FLAVOR} v${VERSION} for ${PLATFORM}...`);
  console.log(`📱 Richiede App Nativa >= ${APP_VERSION}`);
  console.log(`☁️  Azure Container: ${CONTAINER_NAME}`);

  // 1. Crea cartella temp se non esiste
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // 2. Crea ZIP
  const zipName = `bundle_${FLAVOR}_${PLATFORM}_${VERSION}.zip`;
  const zipPath = path.join(TEMP_DIR, zipName);
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

  // 4. Upload ZIP su Azure
  const blobPath = `${FLAVOR}/${PLATFORM}/${zipName}`;
  const zipUrl = await uploadToAzure(zipPath, blobPath);

  // 5. Leggi/Crea Manifest
  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  // 6. Aggiungi nuovo entry
  const newEntry = {
    version: VERSION,
    url: zipUrl,
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
  
  manifest.unshift(newEntry);

  // 7. Salva Manifest localmente
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`📄 Manifest aggiornato: ${MANIFEST_PATH}`);

  // 8. Upload Manifest su Azure
  await uploadToAzure(MANIFEST_PATH, 'updates-manifest.json');

  // 9. Cleanup
  fs.unlinkSync(zipPath);
  console.log(`🗑️  File temporaneo rimosso: ${zipPath}`);

  // 10. Info finale
  console.log(`\n✅ Deploy completato!`);
  console.log(`📦 ZIP URL: ${zipUrl}`);
  console.log(`📄 Manifest URL: ${BASE_URL}/updates-manifest.json`);
  console.log(`\n📁 Struttura corretta su Azure:`);
  console.log(`   hotcode/`);
  console.log(`   ├── updates-manifest.json`);
  console.log(`   ├── ${FLAVOR}/`);
  console.log(`   │   └── ${PLATFORM}/`);
  console.log(`   │       └── ${zipName}`);
}

deploy().catch((e) => {
  console.error('❌ Deploy Failed:', e.message);
  console.error(e);
  process.exit(1);
});