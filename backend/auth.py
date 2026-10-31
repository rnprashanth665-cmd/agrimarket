import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta


# ==========================================
# JWT CONFIGURATION
# ==========================================

SECRET_KEY = "agrimarket-secret-key"
ALGORITHM = "HS256"


# ==========================================
# PASSWORD HASHING
# ==========================================

def hash_password(password: str):

    password_bytes = password.encode("utf-8")

    # bcrypt supports a maximum of 72 bytes
    if len(password_bytes) > 72:
        raise ValueError(
            "Password must be 72 bytes or less"
        )

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode("utf-8")


# ==========================================
# PASSWORD VERIFICATION
# ==========================================

def verify_password(
    plain_password: str,
    hashed_password: str
):

    if not plain_password or not hashed_password:
        return False

    password_bytes = plain_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    # Older records may still store plain-text passwords.
    if hashed_password == plain_password:
        return True

    if not hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
        return False

    hashed_bytes = hashed_password.encode("utf-8")

    try:
        return bcrypt.checkpw(
            password_bytes,
            hashed_bytes
        )

    except ValueError:
        return False


# ==========================================
# CREATE JWT ACCESS TOKEN
# ==========================================

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        hours=24
    )

    to_encode.update({
        "exp": expire
    })

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ==========================================
# DECODE JWT ACCESS TOKEN
# ==========================================

def decode_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None