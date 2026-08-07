import re
import unicodedata
from backend.config import settings

# Common weak passwords that must be rejected outright.
_COMMON_PASSWORDS = {
    "password", "password1", "password12", "password123", "password1234",
    "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop",
    "letmein", "welcome1", "admin123", "admin1234", "changeme",
    "iloveyou", "monkey123", "dragon123", "abc12345", "football1",
    "1234567890a", "a123456789",
}


def normalize_password(password: str) -> str:
    return unicodedata.normalize("NFKC", password)


def validate_password_strength(password: str) -> None:
    """Raise ValueError if the password is too weak.

    Rules: min/max length, must contain letters and digits, at least one
    uppercase and lowercase letter, not on the common-password list, and not
    a single repeated character.
    """
    password = normalize_password(password)

    if len(password) < settings.MIN_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be at least {settings.MIN_PASSWORD_LENGTH} characters long."
        )
    if len(password) > settings.MAX_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must not exceed {settings.MAX_PASSWORD_LENGTH} characters."
        )
    if password.lower() in _COMMON_PASSWORDS:
        raise ValueError("That password is too common. Choose a stronger one.")

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)

    if not (has_upper and has_lower and has_digit):
        raise ValueError(
            "Password must contain at least one uppercase letter, one lowercase "
            "letter, and one digit."
        )
    if len(set(password)) < 4:
        raise ValueError("Password must contain at least 4 distinct characters.")
