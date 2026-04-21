// Service worker pour gérer les événements en arrière-plan (si nécessaire)
chrome.runtime.onInstalled.addListener(() => {
  console.log("[BNJ Autofill] Extension installée avec succès.");
  chrome.storage.local.set({ bnj_autofill_enabled: true });
});
