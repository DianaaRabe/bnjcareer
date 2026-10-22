"""Produit le lot de candidatures du jour, pour relecture avant envoi.

Sortie : drafts/lot_AAAA-MM-JJ.json (offres retenues + canal de candidature).
Aucun email n'est envoye a ce stade.
"""
import datetime
import json
import os
import sys

import pipeline
import sources
from email_finder import trouver_email

sys.stdout.reconfigure(encoding="utf-8")

DRAFTS = os.path.join(os.path.dirname(__file__), "drafts")


def main(n=5):
    print("Recuperation des offres...")
    offres = sources.fetch_all()
    print(f"  {len(offres)} offres brutes")

    retenues = pipeline.selectionner(offres, n=n)
    print(f"  {len(retenues)} retenues apres filtrage Data/IT + deduplication\n")

    lot = []
    for o in retenues:
        email = trouver_email(o.get("entreprise_url"))
        o["destinataire"] = email or ""
        o["canal"] = "email" if email else "lien_offre"
        o["objet"] = f"Candidature Data Analyst - {o['intitule']}"
        o["lettre"] = ""  # a rediger avant envoi
        lot.append(o)
        print(f"[{o['score']:>3}] {o['entreprise']}")
        print(f"      {o['intitule']}  |  {o['lieu']}  |  {o['type_contrat']}")
        print(f"      canal={o['canal']}  {email or o.get('url_postulation') or o.get('url_offre')}\n")

    os.makedirs(DRAFTS, exist_ok=True)
    chemin = os.path.join(DRAFTS, f"lot_{datetime.date.today():%Y-%m-%d}.json")
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(lot, f, ensure_ascii=False, indent=2)
    print(f"Lot ecrit dans {chemin}")
    return chemin


if __name__ == "__main__":
    main()
