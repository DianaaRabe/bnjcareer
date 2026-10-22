"""Envoi SMTP de la candidature : corps = lettre de motivation, CV en piece jointe.

fanilo@bnjteammaker.fr est mis en CCI (Bcc) : il recoit le message sans que
l'adresse apparaisse chez le destinataire. Un en-tete Cc serait visible.
"""
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from dotenv import load_dotenv

load_dotenv()

CV_PATH = os.path.join(os.path.dirname(__file__), "data", "CV_Charlene_Cardoso.pdf")


def _config():
    manquants = [k for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SENDER_EMAIL")
                 if not os.environ.get(k)]
    if manquants:
        raise RuntimeError(
            "Configuration SMTP incomplete dans .env : " + ", ".join(manquants))
    return {
        "host": os.environ["SMTP_HOST"],
        "port": int(os.environ.get("SMTP_PORT", 587)),
        "user": os.environ["SMTP_USER"],
        # Google affiche le mot de passe d'application par groupes de 4.
        "password": os.environ["SMTP_PASSWORD"].replace(" ", ""),
        "from_email": os.environ["SENDER_EMAIL"],
        "from_name": os.environ.get("SENDER_NAME", "Charlene Cardoso"),
        "bcc": os.environ.get("BCC_EMAIL", "fanilo@bnjteammaker.fr"),
        # Un Reply-To hors domaine declenche l'avertissement anti-hameconnage de
        # Gmail. L'adresse de Charlene reste joignable via sa signature.
        "reply_to": os.environ.get("REPLY_TO", os.environ["SENDER_EMAIL"]),
    }


def verifier_cv():
    """Une candidature sans CV est pire que pas de candidature : on bloque."""
    if not os.path.exists(CV_PATH):
        raise RuntimeError(f"CV introuvable : {CV_PATH}")
    donnees = open(CV_PATH, "rb").read()
    if not donnees.startswith(b"%PDF-"):
        raise RuntimeError(f"CV corrompu (en-tete PDF absente) : {CV_PATH}")
    if len(donnees) < 20_000:
        raise RuntimeError(f"CV suspect ({len(donnees)} octets) : {CV_PATH}")
    return donnees


def construire_message(destinataire, objet, corps, cfg):
    msg = EmailMessage()
    msg["From"] = formataddr((cfg["from_name"], cfg["from_email"]))
    msg["To"] = destinataire
    msg["Bcc"] = cfg["bcc"]
    msg["Reply-To"] = cfg["reply_to"]
    msg["Subject"] = objet
    msg.set_content(corps)
    msg.add_attachment(verifier_cv(), maintype="application", subtype="pdf",
                       filename="CV_Charlene_Cardoso_Data_Analyst.pdf")
    pieces = [p for p in msg.iter_attachments()]
    if len(pieces) != 1 or not pieces[0].get_payload(decode=True):
        raise RuntimeError("Piece jointe absente du message construit")
    return msg


def envoyer(destinataire, objet, corps, dry_run=True):
    """dry_run=True : construit et valide le message sans rien envoyer."""
    cfg = _config()
    msg = construire_message(destinataire, objet, corps, cfg)
    if dry_run:
        return {"statut": "dry_run", "destinataire": destinataire, "cci": cfg["bcc"]}
    with smtplib.SMTP(cfg["host"], cfg["port"], timeout=30) as s:
        s.starttls()
        s.login(cfg["user"], cfg["password"])
        s.send_message(msg)
    return {"statut": "envoye", "destinataire": destinataire, "cci": cfg["bcc"]}
