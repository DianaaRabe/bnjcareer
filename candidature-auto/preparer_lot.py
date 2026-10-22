# -*- coding: utf-8 -*-
"""Assemble le lot du jour et produit le .md de relecture.

La lettre de chaque offre provient, par ordre de priorite :
  1. du champ "lettre" deja present dans le lot JSON (redige au fil de l'eau)
  2. de lettres.LETTRES, pour les lots deja traites

Les offres sans lettre restent visibles dans le .md avec une mention explicite,
pour qu'un lot incomplet ne disparaisse pas silencieusement de la relecture.
"""
import datetime
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

try:
    import lettres
    SIGNATURE = lettres.SIGNATURE
    CATALOGUE = lettres.LETTRES
except ImportError:
    SIGNATURE, CATALOGUE = "", {}

DRAFTS = os.path.join(os.path.dirname(__file__), "drafts")


def resoudre(offre):
    """Renvoie (objet, corps) pour une offre, ou (objet, '') si rien n'est redige."""
    if offre.get("lettre"):
        return offre.get("objet", ""), offre["lettre"]
    modele = CATALOGUE.get(offre["entreprise_norm"])
    if modele:
        return modele["objet"], modele["corps"] + SIGNATURE
    return offre.get("objet", ""), ""


def main(jour):
    chemin = os.path.join(DRAFTS, f"lot_{jour}.json")
    if not os.path.exists(chemin):
        sys.exit(f"Lot introuvable : {chemin}")
    lot = json.load(open(chemin, encoding="utf-8"))

    md = [f"# Lot de candidatures du {jour}\n"]
    sans_lettre = []
    for o in lot:
        objet, corps = resoudre(o)
        o["objet"], o["lettre"] = objet, corps
        if not corps:
            sans_lettre.append(o["entreprise"])
        md += [
            f"\n---\n\n## {o['entreprise']} — {o['intitule']}\n",
            f"- **Lieu** : {o['lieu']} | **Contrat** : {o['type_contrat']} | **Score** : {o.get('score', '')}",
            f"- **Canal** : {o['canal']} | **Destinataire** : {o['destinataire'] or '(pas d email — lien officiel)'}",
            f"- **Offre** : {o['url_offre']}",
            f"\n**Objet :** {objet or '(a rediger)'}\n",
            "```",
            corps or "(lettre a rediger)",
            "```",
        ]

    json.dump(lot, open(chemin, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    md_path = os.path.join(DRAFTS, f"lettres_{jour}.md")
    open(md_path, "w", encoding="utf-8").write("\n".join(md))

    print(f"Lot : {len(lot)} offre(s) | lettres pretes : {len(lot) - len(sans_lettre)}")
    if sans_lettre:
        print("A REDIGER :", ", ".join(sans_lettre))
    print("Relecture :", md_path)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else f"{datetime.date.today():%Y-%m-%d}")
