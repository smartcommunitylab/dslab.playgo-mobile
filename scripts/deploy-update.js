// scripts/deploy-update.js
require('dotenv').config();
const fs = require('fs');
const archiver = require('archiver');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configurazione Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parametri da riga di comando o default
const FLAVOR = process.env.FLAVOR || 'production'; 
const APP_ID = FLAVOR === 'stage' ? 'it.dslab.playgo.stage' : 'it.dslab.playgo.production';
const CHANNEL_NAME = FLAVOR === 'stage' ? 'Staging' : 'Production';

// Leggiamo la versione dal package.json
const packageJson = require('../package.json');
const VERSION = packageJson.version; 

// Gestione min_native_version (opzionale da ENV, altrimenti default 0.0.0)
const MIN_NATIVE_VERSION = process.env.MIN_NATIVE || '0.0.0';

async function deploy() {
  console.log(`🚀 Deploying ${FLAVOR} (v${VERSION}) for ${APP_ID}...`);
  console.log(`📱 Richiede Native Version >= ${MIN_NATIVE_VERSION}`);

  // ---------------------------------------------------------
  // 1. Crea ZIP della cartella www/
  // ---------------------------------------------------------
  const zipName = `bundle_${FLAVOR}_${VERSION}.zip`;
  const output = fs.createWriteStream(zipName);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(output);
  archive.directory('www/', false);
  await archive.finalize();
  
  // Attendi che lo stream di scrittura finisca
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  // ---------------------------------------------------------
  // 2. Calcola Checksum SHA256
  // ---------------------------------------------------------
  const fileBuffer = fs.readFileSync(zipName);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const checksum = hashSum.digest('hex');
  console.log(`🔑 Checksum: ${checksum}`);

  // ---------------------------------------------------------
  // 3. Upload su Supabase Storage
  // ---------------------------------------------------------
  // Definiamo il percorso interno al bucket (es: stage/bundle_v1.zip)
  const storagePath = `${FLAVOR}/${zipName}`; 
  
  const { error: upErr } = await supabase.storage
    .from('updates') // Assicurati che il bucket 'updates' esista e sia pubblico
    .upload(storagePath, fileBuffer, { upsert: true, contentType: 'application/zip' });
  
  if (upErr) {
    console.error('❌ Upload fallito');
    throw upErr;
  }

  // --- FIX IMPORTANTE ---
  // Costruiamo il path relativo "Bucket + File Path"
  // Questo permette all'App di ricostruire l'URL completo dinamicamente
  const relativePath = `updates/${storagePath}`; 
  console.log(`☁️ Uploaded to: ${relativePath}`);

  // ---------------------------------------------------------
  // 4. Inserisci nella tabella 'bundles'
  // ---------------------------------------------------------
  console.log('💾 Saving to bundles table...');
  const { error: bundleErr } = await supabase
    .from('bundles')
    .insert({
      app_id: APP_ID,
      version: VERSION,
      url: relativePath, // Salviamo il path relativo!
      checksum: checksum,
      min_native_version: MIN_NATIVE_VERSION
    });
  
  if (bundleErr) {
    console.error('❌ Errore insert bundles');
    throw bundleErr;
  }

  // ---------------------------------------------------------
  // 5. Aggiorna il puntatore nella tabella 'channels'
  // ---------------------------------------------------------
  console.log(`📡 Updating channel ${CHANNEL_NAME} to version ${VERSION}...`);
  
  // Usiamo upsert per aggiornare la versione se il canale esiste già
  // NOTA: Richiede un vincolo UNIQUE su (app_id, name) nel database
  const { error: channelErr } = await supabase
    .from('channels')
    .upsert({
      app_id: APP_ID,
      name: CHANNEL_NAME,
      version: VERSION,
      public: true
    }, { onConflict: 'app_id, name' }); // Specifica su quali colonne verificare il conflitto

  if (channelErr) {
    console.error('❌ Errore update channel');
    throw channelErr;
  }

  // ---------------------------------------------------------
  // 6. Pulizia
  // ---------------------------------------------------------
  fs.unlinkSync(zipName);
  console.log('✅ Deploy Success! Zip locale rimosso.');
}

deploy().catch((e) => {
  console.error('❌ Deploy Failed:', e.message);
  process.exit(1);
});