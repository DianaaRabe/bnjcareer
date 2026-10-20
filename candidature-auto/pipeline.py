"""Filtrage secteur Data/IT, scoring de pertinence et deduplication."""
import csv
import os
import re
import unicodedata

CSV_PATH = os.path.join(os.path.dirname(__file__), "candidatures.csv")

CSV_FIELDS = [
    "date_envoi", "entreprise", "entreprise_norm", "intitule", "lieu",
    "source", "canal", "destinataire", "url_offre", "id_offre", "score", "statut",
]

# Un titre doit contenir au moins un de ces termes pour etre retenu.
TERMES_DATA = [
    "data analyst", "data analyste", "analyste de donnees", "analyste donnees",
    "business intelligence", "power bi", "powerbi", "decisionnel", "analytics",
    "data scientist", "dataviz", "data visualisation", "consultant data",
    "charge d etudes statistiques", "analyste bi", "ingenieur bi", "developpeur bi",
    "data", "bi ",
]

# Faux positifs frequents : "data center" electrique/reseau, metiers hors scope.
TERMES_EXCLUS = [
    "data center", "datacenter", "electricien", "cableur", "technicien de maintenance",
    "commercial", "chauffeur", "manutention", "plombier", "chaudronnier",
    "alternance", "apprenti", "apprentissage", "stage", "stagiaire",
]

# Competences du CV : bonus de score quand elles apparaissent dans l'offre.
COMPETENCES = [
    "power bi", "dax", "power query", "python", "pandas", "sql", "excel",
    "machine learning", "google analytics", "ga4", "hotjar", "ab test", "a/b test",
    "etl", "dashboard", "tableau de bord", "kpi", "reporting", "statistiques",
    "scikit", "numpy", "data visualisation", "storytelling",
]

SUFFIXES_JURIDIQUES = [
    "sas", "sasu", "sarl", "eurl", "sa", "sacs", "scop", "group", "groupe",
    "france", "conseil", "consulting", "technologies", "solutions",
]


def _strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def normalize(s):
    s = _strip_accents((s or "").lower())
    return re.sub(r"[^a-z0-9 ]+", " ", s).strip()


def normalize_company(nom):
    """Cle de deduplication : minuscules, sans accents, sans forme juridique."""
    mots = normalize(nom).split()
    mots = [m for m in mots if m not in SUFFIXES_JURIDIQUES]
    return " ".join(mots) or normalize(nom)


def est_pertinent(offre):
    titre = normalize(offre["intitule"])
    blob = normalize(offre["intitule"] + " " + offre["description"])
    if any(x in blob for x in (normalize(t) for t in TERMES_EXCLUS)):
        return False
    return any(normalize(t) in titre for t in TERMES_DATA)


def score(offre):
    """Score de pertinence : titre exact + competences du CV presentes dans l'offre."""
    titre = normalize(offre["intitule"])
    blob = normalize(offre["intitule"] + " " + offre["description"])
    s = 0
    if "data analyst" in titre or "analyste de donnees" in titre:
        s += 40
    elif any(t in titre for t in ("business intelligence", "power bi", "analytics", "bi")):
        s += 25
    else:
        s += 10
    s += 4 * sum(1 for c in COMPETENCES if normalize(c) in blob)
    if "cdi" in normalize(offre["type_contrat"]):
        s += 10
    if offre.get("url_postulation"):
        s += 5
    return s


def charger_historique():
    """Retourne l'ensemble des cles entreprise deja contactees."""
    if not os.path.exists(CSV_PATH):
        return set()
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        return {row["entreprise_norm"] for row in csv.DictReader(f) if row.get("entreprise_norm")}


def selectionner(offres, n=5):
    """Filtre, deduplique (historique + doublons internes) et renvoie le top N."""
    deja = charger_historique()
    vus = set()
    retenues = []
    for o in sorted(offres, key=score, reverse=True):
        if not o["entreprise"] or not est_pertinent(o):
            continue
        cle = normalize_company(o["entreprise"])
        if cle in deja or cle in vus:
            continue
        vus.add(cle)
        o["entreprise_norm"] = cle
        o["score"] = score(o)
        retenues.append(o)
        if len(retenues) >= n:
            break
    return retenues


def enregistrer(lignes):
    """Ajoute les candidatures envoyees au CSV historique."""
    nouveau = not os.path.exists(CSV_PATH)
    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        if nouveau:
            w.writeheader()
        for l in lignes:
            w.writerow({k: l.get(k, "") for k in CSV_FIELDS})
