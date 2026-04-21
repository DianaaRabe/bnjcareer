document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-autofill");
  const profileContent = document.getElementById("profile-content");
  const profileCard = document.getElementById("profile-card");
  const noProfileMsg = document.getElementById("no-profile-msg");

  // Charger l'état actuel depuis chrome.storage
  chrome.storage.local.get(
    ["bnj_autofill_enabled", "bnj_cv_data"],
    (result) => {
      // Configuration du bouton switch
      toggle.checked = result.bnj_autofill_enabled !== false; // Active par défaut

      // Affichage du profil détecté
      if (result.bnj_cv_data && result.bnj_cv_data.firstName) {
        const cv = result.bnj_cv_data;
        profileContent.innerHTML = `
          <strong>👤 Candidat</strong>
          <span>${cv.firstName || ""} ${cv.lastName || ""}</span>
          
          <strong>✉️ Email</strong>
          <span>${cv.email || "Non renseigné"}</span>
          
          <strong>📱 Téléphone</strong>
          <span>${cv.phone || "Non renseigné"}</span>
          
          <strong>💼 Titre</strong>
          <span>${cv.title || "Non renseigné"}</span>
        `;
        profileCard.style.display = "block";
        noProfileMsg.style.display = "none";
      } else {
        profileCard.style.display = "none";
        noProfileMsg.style.display = "block";
      }
    },
  );

  // Écouter les changements du bouton switch
  toggle.addEventListener("change", (e) => {
    chrome.storage.local.set({ bnj_autofill_enabled: e.target.checked });
  });

  // Gestion du matching
  const matchCard = document.getElementById("match-card");
  const btnMatch = document.getElementById("btn-match");

  // Vérifier si on est sur une page d'offre pour afficher le bouton
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    // On affiche le bouton seulement si on n'est pas sur notre propre site
    if (url && !url.includes("localhost") && !url.includes("bnjcareer")) {
      matchCard.style.display = "block";
    }
  });

  btnMatch.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "GET_JOB_DATA" },
        (response) => {
          if (response) {
            chrome.storage.local.set({ pending_job_match: response }, () => {
              window.open(
                "https://https://bnj-skills-maker.vercel.app//dashboard/jobs?from=extension",
                "_blank",
              );
            });
          }
        },
      );
    });
  });
});
