- BUT: Générer un 1er aperçu de la plateforme d'accompagnement BNJ career, conforma à la charte
  Fonctionnalités :

CV & Matching (IA)
Création de CV personnalisé
● Génération de CV via IA (expériences, compétences)
● Templates professionnels
● Export PDF + lien partageable
Matching profil/offre
● Score de compatibilité
● Analyse des écarts
● Suggestions d’amélioration (mots-clés, compétences)

---

Automatisation et suivi des candidatures
Intégration job boards
● Indeed
● Monster
● Welcome to the Jungle
● Apec
Fonctionnalités
● Centralisation des offres
● Candidature en un clic
● Dashboard de suivi :
○ envoyée
○ en attente
○ refusée
○ entretien

---

Gestion des accompagnements
Calendrier des ateliers
● Vue calendrier
● Sessions :
○ 1v1
○ groupe
● Réservation de créneaux
● Notifications
Suivi des objectifs (gamification)
● Objectifs personnalisés
● Système de progression
● Rappels automatiques

---

Espace de discussion
Messagerie interne
● Chat individuel (coach ↔ candidat)
● Chat communautaire
Fonctionnalités
● messages
● envoi de fichiers
● notifications
Objectif : empêcher les échanges hors plateforme

---

Ressources + IA
Bibliothèque de contenu
● Documents (PDF)
● Vidéos
● Replays d’ateliers
Chatbot IA
● Réponses basées sur les ressources
● Conseils personnalisés :
○ CV
○ entretiens
○ recherche d’emploi

FOCUS Frontend !!

La structure du projet est déjà en place
Le module de recherche d'emploi est déjà fonctionnel ici : http://localhost:3000/dashboard/scrapper
Il reste à intégrer cela dans les menu latéral, etc.
Tu peux décomposer les CVs ici : https://cv-encryptor.onrender.com/api/extract-cv-upload, il s'agit d'une API ui tire les informations des CVs
D'ailleurs, elle renvoie les infos extraits comme ceci :

export interface CvExperience {
title: string;
company: string;
period: string;
missions: string[];
}

export interface CvFormation {
title: string;
school: string;
year: string;
}

export interface CvData {
firstName?: string;
lastName?: string;
email?: string;
phone?: string;
title?: string;
description?: string;
linkedinurl?: string;
experiences?: CvExperience[];
formations?: CvFormation[];
tools?: string[];
}

Pour le matching aussi, tu peux les envoyer ici : https://jobmatchingscore.bnjteammaker.com/analyze
ça attend l'url de l'offre et le CV du candidat
et ça retourne :

- Score
- Commentaires

Si tu as des uestions, n'hésite pas à les poser tout de suite

CV: Pas encore fonctionnel (0 info extrait, pas d'outils de téléchargement pdf, 0 ajout de formations/exp)
Matching IA: Erreur API 500
Database : à implémenter (MVP: Supabase)
Authentification : à implémenter

Supabase DB password : DirR4dKcX9gmGCS0
Supabase URL = https://ogwrtegpknihxixgptqe.supabase.co
Supabase ANON Public = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDMxNDYsImV4cCI6MjA5MTMxOTE0Nn0.uvEaX8gmelDNxclKFiPiCRHbBTU4zrDjtwywdWJT2cw
Supabase Service Role = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3J0ZWdwa25paHhpeGdwdHFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0MzE0NiwiZXhwIjoyMDkxMzE5MTQ2fQ.Qe52dmgdVa_XXip5xC7NxSqFnAwgWTJzZNvs6CB8EaY

LLM key = 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

Notre plateforme doit suciter encore plus les besoins d'accompagnements (ex: tâche d'appel)
Rechercher des formateurs
Formateurs : Payés à la commission + Commission Benjamin
Candiboost et CVboost de la plateforme MeilleurJob
Tableau des abonnements: 600 € sur 3 mois

filtres

Prompt Antigravity :
Nous avons plusieurs soucis :
[{
"resource": "/e:/BNJ Career/apps/web/app/dashboard/ressources/page.tsx",
"owner": "typescript",
"code": "2339",
"severity": 8,
"message": "Property 'id' does not exist on type '{ role: string; content: string; }'.",
"source": "ts",
"startLineNumber": 55,
"startColumn": 25,
"endLineNumber": 55,
"endColumn": 27,
"modelVersionId": 24,
"origin": "extHost1"
}]

[{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'block' applies the same CSS properties as 'flex'.",
"startLineNumber": 131,
"startColumn": 35,
"endLineNumber": 131,
"endColumn": 40,
"relatedInformation": [
{
"startLineNumber": 131,
"startColumn": 85,
"endLineNumber": 131,
"endColumn": 89,
"message": "flex",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'flex' applies the same CSS properties as 'block'.",
"startLineNumber": 131,
"startColumn": 85,
"endLineNumber": 131,
"endColumn": 89,
"relatedInformation": [
{
"startLineNumber": 131,
"startColumn": 35,
"endLineNumber": 131,
"endColumn": 40,
"message": "block",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'block' applies the same CSS properties as 'flex'.",
"startLineNumber": 143,
"startColumn": 35,
"endLineNumber": 143,
"endColumn": 40,
"relatedInformation": [
{
"startLineNumber": 143,
"startColumn": 85,
"endLineNumber": 143,
"endColumn": 89,
"message": "flex",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'flex' applies the same CSS properties as 'block'.",
"startLineNumber": 143,
"startColumn": 85,
"endLineNumber": 143,
"endColumn": 89,
"relatedInformation": [
{
"startLineNumber": 143,
"startColumn": 35,
"endLineNumber": 143,
"endColumn": 40,
"message": "block",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'block' applies the same CSS properties as 'flex'.",
"startLineNumber": 158,
"startColumn": 35,
"endLineNumber": 158,
"endColumn": 40,
"relatedInformation": [
{
"startLineNumber": 158,
"startColumn": 85,
"endLineNumber": 158,
"endColumn": 89,
"message": "flex",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'flex' applies the same CSS properties as 'block'.",
"startLineNumber": 158,
"startColumn": 85,
"endLineNumber": 158,
"endColumn": 89,
"relatedInformation": [
{
"startLineNumber": 158,
"startColumn": 35,
"endLineNumber": 158,
"endColumn": 40,
"message": "block",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'block' applies the same CSS properties as 'flex'.",
"startLineNumber": 174,
"startColumn": 33,
"endLineNumber": 174,
"endColumn": 38,
"relatedInformation": [
{
"startLineNumber": 174,
"startColumn": 83,
"endLineNumber": 174,
"endColumn": 87,
"message": "flex",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
},{
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx",
"owner": "tailwindcss-intellisense",
"code": "cssConflict",
"severity": 4,
"message": "'flex' applies the same CSS properties as 'block'.",
"startLineNumber": 174,
"startColumn": 83,
"endLineNumber": 174,
"endColumn": 87,
"relatedInformation": [
{
"startLineNumber": 174,
"startColumn": 33,
"endLineNumber": 174,
"endColumn": 38,
"message": "block",
"resource": "/e:/BNJ Career/apps/web/components/coach/EventModal.tsx"
}
],
"modelVersionId": 2,
"origin": "extHost1"
}]

1. Pour le traitement LLM, ça renvoie une erreur API,alors ue j'ai entré ma clé dans .env.local
   Chat API Error: Error: OpenRouter API error: Too Many Requests
   at POST (webpack-internal:///(rsc)/./app/api/chat/route.ts:27:19)
   at process.processTicksAndRejections (node:internal/process/task*queues:103:5)
   at async E:\BNJ Career\apps\web\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:53446
   at async e*.execute (E:\BNJ Career\apps\web\node*modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:44747)
   at async e*.handle (E:\BNJ Career\apps\web\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:54700)
   at async doRender (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:1377:42)
   at async cacheEntry.responseCache.get.routeKind (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:1599:28)
   at async DevServer.renderToResponseWithComponentsImpl (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:1507:28)  
    at async DevServer.renderPageComponent (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:1924:24)
   at async DevServer.renderToResponseImpl (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:1962:32)
   at async DevServer.pipeImpl (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:920:25)
   at async NextNodeServer.handleCatchallRenderRequest (E:\BNJ Career\apps\web\node_modules\next\dist\server\next-server.js:272:17)  
    at async DevServer.handleRequestImpl (E:\BNJ Career\apps\web\node_modules\next\dist\server\base-server.js:816:17)
   at async E:\BNJ Career\apps\web\node_modules\next\dist\server\dev\next-dev-server.js:339:20
   at async Span.traceAsyncFn (E:\BNJ Career\apps\web\node_modules\next\dist\trace\trace.js:154:20)
   at async DevServer.handleRequest (E:\BNJ Career\apps\web\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
   at async invokeRender (E:\BNJ Career\apps\web\node_modules\next\dist\server\lib\router-server.js:174:21)
   at async handleRequest (E:\BNJ Career\apps\web\node_modules\next\dist\server\lib\router-server.js:353:24)
   at async requestHandlerImpl (E:\BNJ Career\apps\web\node_modules\next\dist\server\lib\router-server.js:377:13)
   at async Server.requestListener (E:\BNJ Career\apps\web\node_modules\next\dist\server\lib\start-server.js:141:13)
   POST /api/chat 500 in 2886ms
   Alors ue dans mn dashboard Supabase, il est dit ue l'API n'a jamais été appelé

Aussi, il faut ue le texte saisie dans l'input du message soit en noir, parce ue c'est illisible, on ne voit pas du tout le message tapé

2. Pour les modals du coach, on n' a même pas modifié la table dans supabase, du coup, ça renvoie :
   Could not find the 'is_paid' column of 'coach_events' in the schema cache
