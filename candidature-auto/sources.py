"""Recuperation des offres depuis France Travail et Jooble."""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

FT_TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token"
FT_SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search"

MOTS_CLES = [
    "data analyst",
    "analyste de donnees",
    "business intelligence",
    "power bi",
    "data analytics",
    "consultant decisionnel",
]


def _ft_token():
    r = requests.post(
        FT_TOKEN_URL,
        params={"realm": "/partenaire"},
        data={
            "grant_type": "client_credentials",
            "client_id": os.environ["FRANCE_TRAVAIL_CLIENT_ID"],
            "client_secret": os.environ["FRANCE_TRAVAIL_CLIENT_SECRET"],
            "scope": "api_offresdemploiv2 o2dsoffre",
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def fetch_france_travail(region="11", pages=3):
    token = _ft_token()
    headers = {"Authorization": f"Bearer {token}"}
    offres = {}
    for kw in MOTS_CLES:
        for start in range(0, pages * 50, 50):
            r = requests.get(
                FT_SEARCH_URL,
                headers=headers,
                params={"motsCles": kw, "region": region, "range": f"{start}-{start + 49}"},
                timeout=30,
            )
            if r.status_code not in (200, 206):
                break
            res = r.json().get("resultats", [])
            if not res:
                break
            for o in res:
                offres[o["id"]] = _normalize_ft(o)
    return list(offres.values())


def _normalize_ft(o):
    contact = o.get("contact") or {}
    entreprise = o.get("entreprise") or {}
    return {
        "source": "france_travail",
        "id": o.get("id"),
        "entreprise": entreprise.get("nom") or "",
        "entreprise_url": entreprise.get("url") or "",
        "intitule": o.get("intitule") or "",
        "description": o.get("description") or "",
        "lieu": (o.get("lieuTravail") or {}).get("libelle") or "",
        "type_contrat": o.get("typeContratLibelle") or "",
        "date_creation": o.get("dateCreation") or "",
        "url_offre": (o.get("origineOffre") or {}).get("urlOrigine") or "",
        "url_postulation": contact.get("urlPostulation") or "",
        "email_offre": "",  # France Travail anonymise systematiquement ce champ
    }


def fetch_jooble(location="Paris", pages=2):
    key = os.environ.get("JOOBLE_API_KEY")
    if not key:
        return []
    offres = {}
    for kw in ["data analyst", "business intelligence", "power bi"]:
        for page in range(1, pages + 1):
            try:
                r = requests.post(
                    f"https://jooble.org/api/{key}",
                    json={"keywords": kw, "location": location, "page": str(page)},
                    timeout=30,
                )
                if r.status_code != 200:
                    break
                jobs = r.json().get("jobs", [])
            except requests.RequestException:
                break
            if not jobs:
                break
            for j in jobs:
                offres[str(j.get("id"))] = {
                    "source": "jooble",
                    "id": str(j.get("id")),
                    "entreprise": j.get("company") or "",
                    "entreprise_url": "",
                    "intitule": j.get("title") or "",
                    "description": j.get("snippet") or "",
                    "lieu": j.get("location") or "",
                    "type_contrat": j.get("type") or "",
                    "date_creation": j.get("updated") or "",
                    "url_offre": j.get("link") or "",
                    "url_postulation": j.get("link") or "",
                    "email_offre": "",
                }
    return list(offres.values())


def fetch_all():
    return fetch_france_travail() + fetch_jooble()
