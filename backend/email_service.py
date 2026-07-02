import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import datetime

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "votre.email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # Mot de passe d'application Google

def send_email(to_email: str, subject: str, html_content: str):
    if not SMTP_PASSWORD:
        print("ATTENTION: SMTP_PASSWORD non configuré. L'email n'a pas été envoyé à", to_email, flush=True)
        return False
        
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Click & Vibe <{SMTP_EMAIL}>"
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Erreur d'envoi d'email à {to_email}: {e}", flush=True)
        return False

def get_base_html(title, content):
    return f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; margin: 0; padding: 40px 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #333;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FF3366 0%, #9933FF 100%); padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">Click & Vibe</h1>
                <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">La musique générée par IA</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px;">
                {content}
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111111; padding: 20px 40px; text-align: center; border-top: 1px solid #333;">
                <p style="margin: 0; color: #666666; font-size: 12px;">
                    © {datetime.datetime.now().year} Click & Vibe. Tous droits réservés.<br>
                    Si vous n'êtes pas à l'origine de cette action, veuillez ignorer cet email.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def send_verification_email(to_email: str, code: str):
    subject = "Confirmez votre compte Click & Vibe"
    content = f"""
        <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Bienvenue parmi nous !</h2>
        <p style="color: #cccccc; font-size: 16px;">
            Merci de rejoindre la communauté <strong>Click & Vibe</strong>. Pour finaliser la création de votre compte et commencer à générer vos propres morceaux, veuillez utiliser le code de sécurité ci-dessous :
        </p>
        
        <div style="margin: 35px 0; text-align: center;">
            <div style="display: inline-block; padding: 15px 40px; background-color: #2a2a2a; border-radius: 12px; border: 1px solid #FF3366; box-shadow: 0 0 20px rgba(255, 51, 102, 0.15);">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #FF3366;">{code}</span>
            </div>
        </div>
        
        <p style="color: #aaaaaa; font-size: 14px; text-align: center;">
            Ce code est valide pendant 24 heures. Ne le partagez avec personne.
        </p>
    """
    html_content = get_base_html("Confirmation de compte", content)
    return send_email(to_email, subject, html_content)

def send_password_reset_email(to_email: str, code: str):
    subject = "Réinitialisation de votre mot de passe"
    content = f"""
        <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Réinitialisation du mot de passe</h2>
        <p style="color: #cccccc; font-size: 16px;">
            Nous avons reçu une demande pour réinitialiser le mot de passe associé à votre compte <strong>Click & Vibe</strong>.
        </p>
        <p style="color: #cccccc; font-size: 16px;">
            Voici votre code de vérification :
        </p>
        
        <div style="margin: 35px 0; text-align: center;">
            <div style="display: inline-block; padding: 15px 40px; background-color: #2a2a2a; border-radius: 12px; border: 1px solid #9933FF; box-shadow: 0 0 20px rgba(153, 51, 255, 0.15);">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #9933FF;">{code}</span>
            </div>
        </div>
        
        <p style="color: #aaaaaa; font-size: 14px; text-align: center;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe restera inchangé.
        </p>
    """
    html_content = get_base_html("Réinitialisation de mot de passe", content)
    return send_email(to_email, subject, html_content)

import requests
import json

BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")

def send_brevo_email(to_email: str, to_name: str, subject: str, html_content: str):
    if not BREVO_API_KEY:
        print("ATTENTION: BREVO_API_KEY non configuré. L'email n'a pas été envoyé à", to_email, flush=True)
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": "Click & Vibe", "email": "contact@clickandvibe.com"},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 201:
            print(f"Brevo: Email envoyé avec succès à {to_email}", flush=True)
            return True
        else:
            print(f"Brevo API error: {response.text}", flush=True)
            return False
    except Exception as e:
        print(f"Erreur d'envoi via Brevo à {to_email}: {e}", flush=True)
        return False
