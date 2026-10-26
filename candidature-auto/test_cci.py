# -*- coding: utf-8 -*-
"""Verifie que l'adresse en CCI recoit bien le mail sans apparaitre dans les headers."""
import json
import smtplib
import sys

import sender

sys.stdout.reconfigure(encoding="utf-8")

cfg = {"host": "x", "port": 587, "user": "x", "password": "x",
       "from_email": "candidatures@bnjteammaker.fr",
       "from_name": "Charlène Cardoso", "bcc": "fanilo@bnjteammaker.fr"}

o = json.load(open("drafts/lot_2026-09-17.json", encoding="utf-8"))[1]
msg = sender.construire_message("recrutement@exemple.fr", o["objet"], o["lettre"], cfg)

capture = {}


class FakeSMTP(smtplib.SMTP):
    """Court-circuite le reseau mais conserve la logique reelle de send_message."""

    def __init__(self):
        self.local_hostname = "localhost"
        self.esmtp_features = {}
        self.does_esmtp = True

    def ehlo_or_helo_if_needed(self):
        return None

    def sendmail(self, from_addr, to_addrs, msg_str, *a, **k):
        capture.update(from_addr=from_addr, to_addrs=to_addrs, raw=msg_str)


FakeSMTP().send_message(msg)

raw = capture["raw"]
if isinstance(raw, bytes):
    raw = raw.decode("utf-8", "replace")
sep = "\r\n\r\n" if "\r\n\r\n" in raw else "\n\n"
entetes = raw.split(sep)[0]

print("--- ENVELOPPE SMTP (qui recoit reellement) ---")
print("MAIL FROM :", capture["from_addr"])
print("RCPT TO   :", capture["to_addrs"])
print()
print("--- HEADERS VUS PAR LE DESTINATAIRE ---")
for ligne in entetes.splitlines():
    if ligne[:1] not in (" ", "\t") and ":" in ligne:
        cle = ligne.split(":")[0]
        if cle in ("From", "To", "Cc", "Bcc", "Reply-To", "Subject"):
            print("  " + ligne[:95])
print()
ok_recoit = "fanilo@bnjteammaker.fr" in capture["to_addrs"]
ok_cache = "fanilo" not in entetes
print("fanilo recoit le mail          :", ok_recoit)
print("fanilo INVISIBLE dans headers  :", ok_cache)
print()
print("RESULTAT :", "OK" if (ok_recoit and ok_cache) else "ECHEC")
