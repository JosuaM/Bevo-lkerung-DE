/* Speichern der E-Menü-Einstellungen in `const DEFAULTS` der index.html.
   Weg 1: lokaler Server (serve.py) · Weg 2: einmal freigegebene Datei (File System Access API, Chrome/Edge). */
const PROJECT_FILENAME = 'index.html';
const SETTINGS_ENDPOINT = '/__project_settings__';
const DEFAULTS_PATTERN = /const DEFAULTS = \{.*\};/;

const saveState = {
  revision: 0,          // zuletzt angeforderter Stand
  saved: 0,             // zuletzt geschriebener Stand
  writing: false,
  file: null,           // freigegebenes Datei-Handle
  connecting: null,
  serverToken: null,
};

function settingsStatus(message){
  document.getElementById('settings-status').textContent = message;
}

/* Das Datei-Handle bleibt in IndexedDB erhalten, damit die Freigabe nicht jedes Mal nötig ist. */
function fileHandleStore(handle){
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bev-project-file', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('files', handle ? 'readwrite' : 'readonly');
      const files = transaction.objectStore('files');
      const action = handle ? files.put(handle, PROJECT_FILENAME) : files.get(PROJECT_FILENAME);
      let result = null;
      action.onsuccess = () => { result = action.result; };
      transaction.oncomplete = () => { db.close(); resolve(result); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
  });
}

const onLocalServer = location.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(location.hostname);
const serverReady = (async () => {
  if (!onLocalServer) return;
  try{
    const response = await fetch(SETTINGS_ENDPOINT, {cache: 'no-store'});
    if (!response.ok) return;
    const result = await response.json();
    if (result.project === 'bevoelkerung-de' && result.token){
      saveState.serverToken = result.token;
      settingsStatus('Automatisches Speichern in ' + PROJECT_FILENAME + ' aktiv.');
      document.getElementById('savefile').hidden = true;
    }
  }catch{}
})();

fileHandleStore().then(handle => { if (handle) saveState.file = handle; }).catch(() => {});

function isProjectFile(source){
  return DEFAULTS_PATTERN.test(source) && source.includes('id="stage"')
    && source.includes('data-site-version="' + document.body.dataset.siteVersion + '"');
}

async function writeToServer(snapshot){
  const response = await fetch(SETTINGS_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Project-Token': saveState.serverToken},
    body: JSON.stringify(snapshot),
  });
  const result = await response.json();
  if (!response.ok || !result.saved) throw new Error(result.error || 'Speichern fehlgeschlagen.');
}

async function writeToFile(snapshot){
  const source = await (await saveState.file.getFile()).text();
  if (!isProjectFile(source)) throw new Error('Bitte ' + PROJECT_FILENAME + ' dieses Projekts auswählen.');
  const next = source.replace(DEFAULTS_PATTERN, () => 'const DEFAULTS = ' + JSON.stringify(snapshot) + ';');
  const writable = await saveState.file.createWritable();
  try{
    await writable.write(next);
    await writable.close();
  }catch(error){
    try{ await writable.abort(); }catch{}
    throw error;
  }
}

async function flushSettings(){
  if (saveState.writing || (!saveState.file && !saveState.serverToken) || saveState.saved === saveState.revision) return;
  saveState.writing = true;
  try{
    while (saveState.saved < saveState.revision){
      const revision = saveState.revision, snapshot = currentSettings();
      await (saveState.serverToken ? writeToServer(snapshot) : writeToFile(snapshot));
      saveState.saved = revision;
    }
    settingsStatus('Automatisch in ' + PROJECT_FILENAME + ' gespeichert.');
    document.getElementById('savefile').textContent = PROJECT_FILENAME + ' neu verbinden';
  }catch(error){
    settingsStatus('Nicht gespeichert: ' + (error.message || 'Dateizugriff fehlt. Datei erneut verbinden.'));
  }finally{
    saveState.writing = false;
  }
}

async function connectSettingsFile(forcePicker = false){
  if (saveState.connecting) return saveState.connecting;
  saveState.connecting = (async () => {
    if (!window.showOpenFilePicker){
      settingsStatus('Für automatisches Speichern das Projekt über Starten.command öffnen.');
      return;
    }
    try{
      if (forcePicker || !saveState.file){
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [{description: 'Projektdatei ' + PROJECT_FILENAME, accept: {'text/html': ['.html']}}],
        });
        const source = await (await handle.getFile()).text();
        if (handle.name !== PROJECT_FILENAME || !isProjectFile(source)) throw new Error('Bitte ' + PROJECT_FILENAME + ' dieses Projekts auswählen.');
        saveState.file = handle;
      }
      if (await saveState.file.queryPermission({mode: 'readwrite'}) !== 'granted'
          && await saveState.file.requestPermission({mode: 'readwrite'}) !== 'granted'){
        throw new Error('Schreibzugriff wurde nicht freigegeben.');
      }
      try{ await fileHandleStore(saveState.file); }catch{}
      await flushSettings();
    }catch(error){
      settingsStatus(error.name === 'AbortError'
        ? 'Noch nicht gespeichert. ' + PROJECT_FILENAME + ' einmal freigeben.'
        : 'Nicht gespeichert: ' + error.message);
    }
  })();
  try{ await saveState.connecting; }finally{ saveState.connecting = null; }
}

function saveSettings(){
  saveState.revision++;
  settingsStatus('Änderung wird in ' + PROJECT_FILENAME + ' gespeichert …');
  if (saveState.serverToken){ flushSettings(); return; }
  if (onLocalServer){
    serverReady.then(() => saveState.serverToken ? flushSettings() : connectSettingsFile());
  }else connectSettingsFile();
}

addEventListener('beforeunload', event => {
  if (saveState.saved < saveState.revision){ event.preventDefault(); event.returnValue = ''; }
});
