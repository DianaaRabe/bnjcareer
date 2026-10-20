# -*- coding: utf-8 -*-
"""Enrichissement gratuit : nom d'entreprise -> domaine verifie -> adresse email.

Strategie, sans service payant et sans contournement d'anti-bot :
  1. generer des domaines candidats a partir du nom (delys -> delys.fr, .com...)
  2. ne garder que ceux qui ont un enregistrement MX (le domaine recoit du mail)
  3. confirmer que le site parle bien de l'entreprise (evite les homonymes)
  4. lire les emails publies sur le site (contact, mentions legales, recrutement)
  5. a defaut seulement, proposer contact@domaine -- non verifie

L'etape 3 est ce qui separe l'enrichissement de la devinette : sans elle,
"delys.fr" pourrait appartenir a une societe sans aucun rapport.
"""
import re
import sys
import unicodedata

import requests

from email_finder import RX_EMAIL, REJET, _score_email, CHEMINS

DOH = "https://dns.google/resolve"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}

MOTS_VIDES = {"sas", "sasu", "sarl", "eurl", "sa", "groupe", "group", "france",
              "l", "le", "la", "les", "de", "du", "des", "et"}

TLDS = [".fr", ".com", ".io", ".net", ".co"]
PREFIXES_RH = ["recrutement", "rh", "contact", "candidature", "jobs"]


def _slug(nom):
    s = unicodedata.normalize("NFD", (nom or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", s).split()


def domaines_candidats(nom):
    mots = [m for m in _slug(nom) if m not in MOTS_VIDES]
    if not mots:
        return []
    bases = []
    joint = "".join(mots)
    bases.append(joint)
    if len(mots) > 1:
        bases.append("-".join(mots))
        bases.append(mots[0])
    cands = []
    for b in dict.fromkeys(bases):
        if len(b) < 3:
            continue
        for tld in TLDS:
            cands.append(b + tld)
    return cands[:12]


def a_des_mx(domaine):
    """Le domaine accepte-t-il du courrier ? (MX, sinon A en repli)"""
    try:
        r = requests.get(DOH, params={"name": domaine, "type": "MX"}, timeout=10).json()
        return bool(r.get("Answer"))
    except requests.RequestException:
        return False


def site_confirme(domaine, nom_entreprise, timeout=8):
    """Verifie que le site correspond bien a l'entreprise cherchee."""
    mots = [m for m in _slug(nom_entreprise) if m not in MOTS_VIDES and len(m) > 2]
    if not mots:
        return None
    for scheme in ("https://", "http://"):
        try:
            r = requests.get(scheme + domaine, headers=UA, timeout=timeout, allow_redirects=True)
        except requests.RequestException:
            continue
        if r.status_code != 200:
            continue
        page = unicodedata.normalize("NFD", r.text.lower())
        page = "".join(c for c in page if unicodedata.category(c) != "Mn")
        if sum(1 for m in mots if m in page) >= max(1, len(mots) // 2):
            return r.url
        return None
    return None


def _nettoyer(texte):
    """Deseschappe les artefacts JSON/HTML qui polluent la detection d'email.

    Sans cela, "\\u003etournages.cinema@sncf.fr" est capture avec son prefixe
    d'echappement et produit une adresse invalide.
    """
    texte = re.sub(r"\\u[0-9a-fA-F]{4}", " ", texte)
    texte = re.sub(r"&#?\w{2,8};", " ", texte)
    return texte.replace("%40", "@")


def emails_du_site(url_base, timeout=8):
    trouves = set()
    base = url_base.rstrip("/")
    for chemin in CHEMINS:
        try:
            r = requests.get(base + chemin, headers=UA, timeout=timeout)
            if r.status_code != 200:
                continue
            for m in RX_EMAIL.findall(_nettoyer(r.text)):
                m = m.lower().rstrip(".")
                if any(x in m for x in REJET) or m.endswith((".png", ".jpg", ".gif", ".webp", ".svg")):
                    continue
                trouves.add(m)
        except requests.RequestException:
            continue
    return sorted(trouves, key=_score_email, reverse=True)


def enrichir(nom_entreprise, url_connue=""):
    """Retourne un dict decrivant ce qui a pu etre etabli, et avec quelle certitude."""
    res = {"entreprise": nom_entreprise, "domaine": "", "site": "",
           "email": "", "confiance": "aucune", "details": ""}

    if url_connue:
        site = url_connue if url_connue.startswith("http") else "https://" + url_connue
        res["site"] = site
        res["domaine"] = re.sub(r"^https?://(www\.)?", "", site).split("/")[0]
    else:
        for d in domaines_candidats(nom_entreprise):
            if not a_des_mx(d):
                continue
            site = site_confirme(d, nom_entreprise)
            if site:
                res["domaine"], res["site"] = d, site
                break
        if not res["domaine"]:
            res["details"] = "aucun domaine candidat confirme"
            return res

    emails = emails_du_site(res["site"]) if res["site"] else []
    if emails:
        res["email"] = emails[0]
        res["confiance"] = "verifiee"
        res["details"] = f"publiee sur le site ({len(emails)} trouvee(s))"
        return res

    res["email"] = f"contact@{res['domaine']}"
    res["confiance"] = "devinee"
    res["details"] = "aucune adresse publiee ; motif contact@ non verifie"
    return res


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    import json
    lot = json.load(open("drafts/lot_2026-09-17.json", encoding="utf-8"))
    noms = [o["entreprise"] for o in lot] if len(sys.argv) < 2 else sys.argv[1:]
    for n in noms:
        r = enrichir(n)
        print(f"{n}")
        print(f"   domaine   : {r['domaine'] or '-'}")
        print(f"   email     : {r['email'] or '-'}  [{r['confiance']}]")
        print(f"   details   : {r['details']}\n")
