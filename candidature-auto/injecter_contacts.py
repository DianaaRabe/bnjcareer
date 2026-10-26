# -*- coding: utf-8 -*-
"""Injecte les contacts RH enrichis (Apollo) dans le lot du jour.

Les offres issues des job boards sont anonymisees : elles arrivent en
canal "lien_offre" et ne sont pas envoyables. Les contacts enrichis, eux,
portent une adresse nominative et basculent le lot en canal "email".

    python injecter_contacts.py [jour]

Lit drafts/contacts_<jour>.json et fusionne dans drafts/lot_<jour>.json.
La deduplication CSV s'applique : une entreprise deja contactee est ignoree.
"""
import datetime
import json
import os
import sys

import pipeline

sys.stdout.reconfigure(encoding="utf-8")

DRAFTS = os.path.join(os.path.dirname(__file__), "drafts")


def main(jour):
    chemin_contacts = os.path.join(DRAFTS, f"contacts_{jour}.json")
    chemin_lot = os.path.join(DRAFTS, f"lot_{jour}.json")
    if not os.path.exists(chemin_contacts):
        sys.exit(f"Contacts introuvables : {chemin_contacts}")

    contacts = json.load(open(chemin_contacts, encoding="utf-8"))
    lot = json.load(open(chemin_lot, encoding="utf-8")) if os.path.exists(chemin_lot) else []

    deja = pipeline.charger_historique() | {o["entreprise_norm"] for o in lot}
    ajoutes = []
    for c in contacts:
        norm = pipeline.normalize_company(c["entreprise"])
        if norm in deja:
            print(f"  ignore (deja contactee) : {c['entreprise']}")
            continue
        deja.add(norm)
        ajoutes.append({
            "id": c["id"],
            "entreprise": c["entreprise"],
            "entreprise_norm": norm,
            "intitule": c["intitule"],
            "lieu": c["lieu"],
            "type_contrat": c.get("type_contrat", ""),
            "source": c.get("source", "apollo"),
            "url_offre": c.get("url_offre", ""),
            "url_postulation": "",
            "email_offre": c["destinataire"],
            "destinataire": c["destinataire"],
            "contact_nom": c.get("contact_nom", ""),
            "contact_titre": c.get("contact_titre", ""),
            "canal": "email",
            "score": c.get("score", 0),
            "objet": "",
            "lettre": "",
        })

    lot += ajoutes
    lot.sort(key=lambda o: o.get("score", 0), reverse=True)
    json.dump(lot, open(chemin_lot, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{len(ajoutes)} contact(s) ajoute(s) | lot : {len(lot)} offre(s)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else f"{datetime.date.today():%Y-%m-%d}")
