"""Recherche best-effort d'une adresse de contact a partir du site de l'entreprise.

Les job boards n'exposent aucun email de recruteur (verifie sur 423 offres France
Travail : 0 adresse reelle). Seule option restante : la page contact / mentions
legales du site de l'entreprise, quand son URL est connue. La couverture est donc
partielle par construction.
"""
import re
import requests

RX_EMAIL = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

CHEMINS = ["", "/contact", "/contacts", "/mentions-legales", "/nous-rejoindre", "/carrieres", "/recrutement"]

# Adresses inutilisables pour une candidature.
REJET = ("noreply", "no-reply", "donotreply", "postmaster", "abuse", "privacy",
         "dpo", "rgpd", "webmaster", "sentry", "wixpress", "example.com")

PRIORITES = ["recrutement", "rh", "job", "career", "carriere", "candidature", "talent", "hr"]


def _score_email(addr):
    local = addr.split("@")[0].lower()
    for i, p in enumerate(PRIORITES):
        if p in local:
            return 100 - i
    if local in ("contact", "info", "hello", "bonjour"):
        return 40
    return 10


def trouver_email(url_entreprise, timeout=8):
    """Retourne la meilleure adresse trouvee sur le site, ou None."""
    if not url_entreprise:
        return None
    base = url_entreprise.rstrip("/")
    if not base.startswith("http"):
        base = "https://" + base
    trouves = set()
    for chemin in CHEMINS:
        try:
            r = requests.get(base + chemin, timeout=timeout,
                             headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code != 200:
                continue
            for m in RX_EMAIL.findall(r.text):
                m = m.lower().rstrip(".")
                if any(x in m for x in REJET):
                    continue
                if m.endswith((".png", ".jpg", ".gif", ".webp", ".svg")):
                    continue
                trouves.add(m)
        except requests.RequestException:
            continue
        if trouves:
            break
    if not trouves:
        return None
    return max(trouves, key=_score_email)
