- BUT: Générer un 1er aperçu de la plateforme d'accompagnement BNJ career, conforma à la charte
Fonctionnalités : 

 CV & Matching (IA)
Création de CV personnalisé
●	Génération de CV via IA (expériences, compétences)
●	Templates professionnels
●	Export PDF + lien partageable
Matching profil/offre
●	Score de compatibilité
●	Analyse des écarts
●	Suggestions d’amélioration (mots-clés, compétences)
________________________________________
Automatisation et suivi des candidatures
Intégration job boards
●	Indeed
●	Monster
●	Welcome to the Jungle
●	Apec
Fonctionnalités
●	Centralisation des offres
●	Candidature en un clic
●	Dashboard de suivi :
○	envoyée
○	en attente
○	refusée
○	entretien
________________________________________
Gestion des accompagnements
Calendrier des ateliers
●	Vue calendrier
●	Sessions :
○	1v1
○	groupe
●	Réservation de créneaux
●	Notifications
Suivi des objectifs (gamification)
●	Objectifs personnalisés
●	Système de progression
●	Rappels automatiques
________________________________________
 Espace de discussion
Messagerie interne
●	Chat individuel (coach ↔ candidat)
●	Chat communautaire
Fonctionnalités
●	messages
●	envoi de fichiers
●	notifications
Objectif : empêcher les échanges hors plateforme
________________________________________
Ressources + IA
Bibliothèque de contenu
●	Documents (PDF)
●	Vidéos
●	Replays d’ateliers
Chatbot IA
●	Réponses basées sur les ressources
●	Conseils personnalisés :
○	CV
○	entretiens
○	recherche d’emploi


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