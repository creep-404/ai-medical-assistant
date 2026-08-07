"""SMTP email delivery for password reset (optional)."""

import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.utils import formataddr

from backend.config import settings

logger = logging.getLogger("email")


def _is_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM)


def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """Send a password reset link. Returns False if SMTP is not configured."""
    if not _is_configured():
        logger.warning("SMTP not configured; password reset email to %s was skipped.", to_email)
        return False

    from_addr = formataddr((settings.PROJECT_NAME, settings.SMTP_FROM))
    msg = MIMEText(
        f"Hi,\n\nWe received a request to reset your MediAssist AI password.\n"
        f"Use the link below to set a new password. This link expires in 30 minutes.\n\n"
        f"{reset_url}\n\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"MediAssist AI Security Team",
        "plain",
        "utf-8",
    )
    msg["Subject"] = "MediAssist AI - Password Reset"
    msg["From"] = from_addr
    msg["To"] = to_email

    try:
        if settings.SMTP_TLS:
            context = ssl.create_default_context()
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.starttls(context=context)
                if settings.SMTP_USER:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USER:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send password reset email to %s: %s", to_email, exc)
        return False
