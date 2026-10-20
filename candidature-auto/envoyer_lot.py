# -*- coding: utf-8 -*-
"""Envoie le lot valide et enregistre les candidatures dans candidatures.csv.

Par defaut en simulation. L'envoi reel exige le drapeau --envoyer.

    python envoyer_lot.py                  # simulation
    python envoyer_lot.py --envoyer        # envoi reel des offres a canal=email
    python envoyer_lot.py --deposee SNCF   # trace une candidature deposee via le lien officiel

Le CSV n'est ecrit que pour les candidatures reellement parties : une entreprise
jamais contactee ne doit pas etre bloquee par la deduplication.
"""
import argparse
import datetime
import json
import os
import sys

import pipeline
import sender

sys.stdout.reconfigure(encoding="utf-8")


def charger_lot(jour):
    chemin = os.path.join(os.path.dirname(__file__), "drafts", f"lot_{jour}.json")
    if not os.path.exists(chemin):
        sys.exit(f"Lot introuvable : {chemin}")
    return chemin, json.load(open(chemin, encoding="utf-8"))


def ligne_csv(offre, canal, destinataire, statut):
    return {
        "date_envoi": f"{datetime.date.today():%Y-%m-%d}",
        "entreprise": offre["entreprise"],
        "entreprise_norm": offre["entreprise_norm"],
        "intitule": offre["intitule"],
        "lieu": offre["lieu"],
        "source": offre["source"],
        "canal": canal,
        "destinataire": destinataire,
        "url_offre": offre["url_offre"],
        "id_offre": offre["id"],
        "score": offre.get("score", ""),
        "statut": statut,
    }


def marquer_deposee(lot, motif, jour):
    """Trace une candidature deposee a la main via le formulaire officiel."""
    cible = motif.lower()
    trouves = [o for o in lot if cible in o["entreprise"].lower()]
    if not trouves:
        sys.exit(f"Aucune entreprise du lot ne correspond a '{motif}'")
    if len(trouves) > 1:
        sys.exit("Ambigu : " + ", ".join(o["entreprise"] for o in trouves))
    o = trouves[0]
    if pipeline.normalize_company(o["entreprise"]) in pipeline.charger_historique():
        sys.exit(f"{o['entreprise']} est deja dans le CSV.")
    pipeline.enregistrer([ligne_csv(o, "lien_offre", o["url_offre"], "deposee")])
    print(f"Enregistre : {o['entreprise']} — {o['intitule']} (lien officiel)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jour", default=f"{datetime.date.today():%Y-%m-%d}")
    ap.add_argument("--envoyer", action="store_true", help="envoi reel (sinon simulation)")
    ap.add_argument("--deposee", metavar="ENTREPRISE",
                    help="trace une candidature deposee via le lien officiel")
    args = ap.parse_args()

    _, lot = charger_lot(args.jour)

    if args.deposee:
        return marquer_deposee(lot, args.deposee, args.jour)

    par_email = [o for o in lot if o.get("canal") == "email" and o.get("destinataire")]
    par_lien = [o for o in lot if o not in par_email]

    if par_lien:
        print(f"{len(par_lien)} candidature(s) sans email — depot via le lien officiel :")
        for o in par_lien:
            print(f"  - {o['entreprise']} : {o['url_postulation'] or o['url_offre']}")
        print("  (une fois deposee : python envoyer_lot.py --deposee \"<entreprise>\")\n")

    if not par_email:
        print("Aucune candidature envoyable par email dans ce lot.")
        return

    sans_lettre = [o["entreprise"] for o in par_email if not o.get("lettre")]
    if sans_lettre:
        sys.exit("Lettre manquante pour : " + ", ".join(sans_lettre))

    try:
        taille = len(sender.verifier_cv())
    except RuntimeError as e:
        sys.exit(f"Envoi annule — {e}")
    print(f"CV verifie : {taille // 1024} Ko\n")

    mode = "ENVOI REEL" if args.envoyer else "SIMULATION"
    print(f"--- {mode} — {len(par_email)} email(s) ---")
    envoyees = []
    for o in par_email:
        try:
            r = sender.envoyer(o["destinataire"], o["objet"], o["lettre"],
                               dry_run=not args.envoyer)
            print(f"  [{r['statut']}] {o['entreprise']} -> {o['destinataire']} (cci {r['cci']})")
            if args.envoyer:
                envoyees.append(ligne_csv(o, "email", o["destinataire"], "envoyee"))
        except Exception as e:
            print(f"  [ECHEC] {o['entreprise']} : {e}")

    if envoyees:
        pipeline.enregistrer(envoyees)
        print(f"\n{len(envoyees)} ligne(s) ajoutee(s) a candidatures.csv")
    elif not args.envoyer:
        print("\nSimulation : aucun email envoye, CSV inchange.")


if __name__ == "__main__":
    main()
