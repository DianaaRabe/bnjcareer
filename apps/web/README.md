# BNJ Career - Web App (Frontend)

Ceci est le frontend de la plateforme **BNJ Career**, construit avec Next.js 14.

## 📁 Structure du Projet

*   `app/` : Routes du dashboard (CV, Scrapper, Jobs, Coaching, Messages, Ressources).
*   `components/` : Composants UI réutilisables et modules spécifiques.
*   `public/` : Assets statiques.

## 🚀 Développement

Pour lancer le serveur de développement :

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## 🔗 Intégrations API

Cette application communique avec plusieurs services externes :
*   **Extraction CV** : `https://cv-encryptor.onrender.com/api/extract-cv-upload`
*   **Matching Score** : `https://jobmatchingscore.bnjteammaker.com/analyze`
*   **Scrapping Indeed** : Via l'API Apify (token nécessaire dans `.env`).

---
BNJ Teammaker 2025
