# -*- coding: utf-8 -*-
"""Redige la lettre des offres du lot absentes du catalogue lettres.py.

    python rediger_lettres.py [jour]

Ecrit "objet" et "lettre" directement dans drafts/lot_<jour>.json. Comme
preparer_lot.py donne la priorite au champ "lettre" deja present, il suffit
de lancer ce script avant lui.

Le lot partant sans relecture humaine, la generation est bridee des deux cotes :
en amont le modele ne recoit qu'une liste figee de faits verifies, en aval
chaque lettre passe une batterie de controles (valider()) et toute lettre
suspecte est laissee vide — envoyer_lot.py refusera alors le lot entier
plutot que d'expedier une candidature inventee.
"""
import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.request

from dotenv import load_dotenv

import lettres

load_dotenv()
sys.stdout.reconfigure(encoding="utf-8")

DRAFTS = os.path.join(os.path.dirname(__file__), "drafts")
MODELE = "claude-sonnet-4-6"

# Seuls faits que le modele a le droit d'utiliser. Tout chiffre absent de cette
# liste est traite comme une hallucination par valider().
FAITS = """\
- Certification Data Analyst & IA, 480 heures, Universite Paris 1 Pantheon-Sorbonne.
  Competences : SQL (jointures, agregats, sous-requetes), Python, Power BI (DAX,
  Power Query), ETL, machine learning.
- Projets de formation : analyse de churn, prevision de chiffre d'affaires,
  dashboard decisionnel sur donnees Enedis, optimisation d'une supply chain a
  partir de donnees de rupture.
- Sept annees anterieures en conception de produits digitaux en environnement
  client : recueil et cadrage du besoin, animation d'ateliers, restitution a des
  directions operationnelles.
- Resultats chiffres cote produit : +20 % d'inscriptions chez Vestiaire
  Collective, +70 % de taux de remplissage chez CISAC, +10 % de conversion chez
  Carventura (PSA).
- Disponible immediatement. CV joint au message."""

CHIFFRES_AUTORISES = {"10", "20", "70", "480"}

CONSIGNES = """\
Tu rediges une lettre de motivation pour Charlene Cardoso, candidate Data Analyst.

Regles absolues :
- N'utilise QUE les faits de la liste fournie. N'invente aucun chiffre, aucun
  employeur, aucun diplome, aucune techno, aucune duree.
- N'invente rien non plus sur l'entreprise destinataire : tu ne sais d'elle que
  son nom, son secteur apparent et l'intitule du poste. Reste a ce niveau.
- Charlene sort de formation : ne lui prete jamais un poste de Data Analyst deja
  occupe en entreprise.
- Ecris en francais, a la premiere personne, 250 a 320 mots.
- Ouvre par "Bonjour {prenom}," si un prenom est fourni, sinon par
  "Madame, Monsieur,".
- Termine par une phrase proposant un echange. N'ajoute aucune signature.
- Reponds uniquement par le corps de la lettre, sans commentaire ni titre."""


def _appel_modele(prompt, cle):
    corps = json.dumps({
        "model": MODELE,
        "max_tokens": 1200,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=corps,
        headers={"x-api-key": cle, "anthropic-version": "2023-06-01",
                 "content-type": "application/json"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)["content"][0]["text"].strip()


def valider(texte, offre):
    """Renvoie la liste des anomalies rendant la lettre inenvoyable."""
    pbs = []
    if not 800 <= len(texte) <= 2600:
        pbs.append(f"longueur {len(texte)}")
    for marqueur in ("[", "]", "{", "}", "XXX", "...", "Lorem"):
        if marqueur in texte:
            pbs.append(f"marqueur residuel {marqueur!r}")
    for chiffre in set(re.findall(r"(\d+(?:[.,]\d+)?)\s*%", texte)):
        if chiffre not in CHIFFRES_AUTORISES:
            pbs.append(f"chiffre non verifie : {chiffre} %")
    if offre["entreprise"].split()[0].lower() not in texte.lower():
        pbs.append("nom de l'entreprise absent")
    prenom = (offre.get("contact_nom") or "").strip()
    if prenom and not texte.startswith(f"Bonjour {prenom}"):
        pbs.append(f"accroche ne s'adresse pas a {prenom}")
    if not prenom and not texte.startswith("Madame, Monsieur"):
        pbs.append("accroche manquante")
    return pbs


def main(jour):
    chemin = os.path.join(DRAFTS, f"lot_{jour}.json")
    if not os.path.exists(chemin):
        sys.exit(f"Lot introuvable : {chemin}")
    lot = json.load(open(chemin, encoding="utf-8"))

    a_faire = [o for o in lot
               if not o.get("lettre") and o["entreprise_norm"] not in lettres.LETTRES]
    if not a_faire:
        print("Toutes les lettres du lot sont deja disponibles.")
        return

    cle = os.environ.get("ANTHROPIC_API_KEY")
    if not cle:
        sys.exit("ANTHROPIC_API_KEY absente du .env — redaction impossible.")

    redigees = 0
    for o in a_faire:
        prompt = (
            f"{CONSIGNES}\n\nFaits verifies :\n{FAITS}\n\n"
            f"Entreprise : {o['entreprise']}\n"
            f"Poste : {o['intitule']}\nLieu : {o['lieu']}\n"
            f"Prenom du destinataire : {o.get('contact_nom') or '(aucun)'}\n"
            f"Fonction du destinataire : {o.get('contact_titre') or '(inconnue)'}"
        )
        try:
            texte = _appel_modele(prompt, cle)
        except (urllib.error.URLError, KeyError, TimeoutError) as e:
            print(f"  [ECHEC] {o['entreprise']} : {e}")
            continue

        pbs = valider(texte, o)
        if pbs:
            print(f"  [REJET] {o['entreprise']} : " + " ; ".join(pbs))
            continue

        o["objet"] = f"{o['intitule']} — candidature de Charlène Cardoso"
        o["lettre"] = texte + lettres.SIGNATURE
        redigees += 1
        print(f"  [ok] {o['entreprise']} ({len(texte)} caracteres)")

    json.dump(lot, open(chemin, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\n{redigees}/{len(a_faire)} lettre(s) redigee(s)")
    if redigees < len(a_faire):
        print("Les offres sans lettre bloqueront l'envoi du lot (voulu).")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else f"{datetime.date.today():%Y-%m-%d}")
