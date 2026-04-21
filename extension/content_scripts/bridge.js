// Dès que la page BNJ Skills Maker est chargée, on synchro les données CV
function syncCvToExtension() {
  const raw = localStorage.getItem('user_cv_parsed');
  if (raw) {
    try {
      const cvData = JSON.parse(raw);
      chrome.storage.local.set({ bnj_cv_data: cvData }, () => {
        console.log("[BNJ Autofill] CV parsé détecté et synchronisé vers l'extension Chrome.", cvData.firstName);
      });
    } catch (e) {
        console.error('[BNJ Autofill] Erreur de synchronisation du CV', e);
    }
  } else {
      console.log('[BNJ Autofill] Aucun CV trouvé dans le localStorage pour le moment.');
  }
}

syncCvToExtension();

// Nouveau : Transférer les données d'offre depuis l'extension vers le Dashboard
function syncJobFromExtension() {
  chrome.storage.local.get(['pending_job_match'], (result) => {
    if (result.pending_job_match) {
      localStorage.setItem('extension_job_match', JSON.stringify(result.pending_job_match));
      // Nettoyer après transfert pour éviter les répétitions au refresh
      chrome.storage.local.remove('pending_job_match');
      console.log("[BNJ Match] Offre transférée de l'extension vers le localStorage.");
      
      // Déclencher un événement custom pour que React puisse réagir si déjà sur la page
      window.dispatchEvent(new CustomEvent('extension_job_loaded'));
    }
  });
}

syncJobFromExtension();

// Observer les changements (ex: nouveau CV uploadé)
window.addEventListener('storage', (e) => {
  if (e.key === 'user_cv_parsed') syncCvToExtension();
});
