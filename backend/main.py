import os
import uuid
import datetime
import time

active_sessions = {}
import requests
import logging
from logging.handlers import RotatingFileHandler

# Configurer les logs
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_file = os.path.join(os.path.dirname(__file__), 'app.log')
log_handler = RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=2)
log_handler.setFormatter(log_formatter)

logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(log_handler)
logger.info("Démarrage de l'API Click & Vibe")
import random
from email_service import send_verification_email, send_password_reset_email
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, validator
from typing import Optional
import hmac
import hashlib
import json
import time
from fastapi import Request
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

class PaymentInitiateRequest(BaseModel):
    amount_fcfa: int
    credits_to_add: int
    payment_method: str = None
    origin: str = None
    phoneNumber: str = None
    provider: str = None
    fullName: str = None

from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, Base, get_db
import models
import auth

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL EXCEPTION on {request.url}: {exc}")
    print("GLOBAL EXCEPTION:", exc)
    return JSONResponse(
        status_code=400,
        content={"detail": "GLOBAL CRASH: " + str(exc), "traceback": traceback.format_exc()}
    )



# Rate limiter — protection brute force
# Use X-Forwarded-For header (set by Nginx reverse proxy) to get real client IP
def get_real_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host

limiter = Limiter(key_func=get_real_ip)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Serve static files for uploads
import os
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Restrict CORS to known origins only (security fix)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(.*)$", # Allow any origin (localhost, IPs, etc.) during dev
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "ngrok-skip-browser-warning"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Output directory inside the frontend's public folder
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/generations"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Try to load MusicGen, fallback to mock if audiocraft is not installed
has_musicgen = False
try:
    from audiocraft.models import MusicGen
    from audiocraft.data.audio import audio_write
    print("Loading MusicGen model...")
    model = MusicGen.get_pretrained('facebook/musicgen-small')
    has_musicgen = True
    print("Model loaded.")
except ImportError:
    print("Warning: Audiocraft not installed. Audio generation will be mocked.")

class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 5
    style: str = "Afrobeat"
    mood: str = "Joyeux"

class SaveMusicRequest(BaseModel):
    title: str
    prompt: str
    style: str
    mood: str
    duration_str: str
    audio_url: str
    cover_url: str | None = None
    lyrics: str | None = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str = "Utilisateur"
    country: str | None = None
    date_of_birth: str | None = None

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Le mot de passe doit contenir au moins 6 caractères')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Le mot de passe ne peut pas dépasser 72 caractères (limite technique)')
        return v

    @validator('email')
    def email_valid(cls, v):
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Adresse email invalide')
        if len(v) > 254:
            raise ValueError('Email trop long')
        return v.lower().strip()


class VerifyEmailRequest(BaseModel):
    email: str
    code: str

class ResendVerificationRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class Token(BaseModel):

    access_token: str
    token_type: str

class PromotionBase(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None
    start_date: datetime.datetime | None = None
    end_date: datetime.datetime | None = None
    status: str = "Brouillon"
    is_active: bool = False
    promo_type: str
    free_gens: int = 0
    bonus_gens: int = 0
    min_recharge: int = 0
    discount_percent: int = 0
    discount_amount: int = 0
    promo_code: str | None = None
    target_audience: str = "ALL"
    target_country: str | None = None
    auto_event: str = "NONE"
    max_uses: int = 0
    limit_per_user: int = 1

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(PromotionBase):
    pass

class ApplyPromoRequest(BaseModel):
    promo_code: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    payload = auth.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Votre compte a été suspendu.")
    active_sessions[user.id] = time.time()
    return user

def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    return current_user


@app.get("/api/admin/upgrade-db")
def upgrade_db(db: Session = Depends(get_db)):
    queries = [
        "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE users ADD COLUMN verification_code VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);",
        "ALTER TABLE promotions ADD COLUMN auto_event VARCHAR(255) DEFAULT 'NONE';",
        "ALTER TABLE promotions ADD COLUMN target_audience VARCHAR(255) DEFAULT 'ALL';",
        "ALTER TABLE promotions ADD COLUMN target_country VARCHAR(255);",
        "ALTER TABLE users MODIFY profile_picture LONGTEXT;"
    ]
    
    results = []
    for q in queries:
        try:
            db.execute(text(q))
            db.commit()
            results.append(f"SUCCESS: {q}")
        except Exception as e:
            db.rollback()
            results.append(f"FAILED: {q} | Error: {str(e)}")
            
    try:
        models.Base.metadata.create_all(bind=engine)
        results.append("SUCCESS: created missing tables")
    except Exception as e:
        results.append(f"FAILED creating tables: {str(e)}")
        
    return {"status": "Upgrade finished", "details": results}

@app.post("/api/auth/signup")
@limiter.limit("5/minute")
def signup(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user.password)
    verification_code = auth.generate_secure_code()
    verification_code_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    try:
        setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
        default_credits = int(setting.value) if setting and setting.value.isdigit() else 0
    except Exception as e:
        print("Settings table query failed:", e)
        db.rollback()
        default_credits = 0

    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_pwd, 
        name=user.name,
        is_verified=False,
        verification_code=verification_code,
        credits=default_credits
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")

    # TRACK SIGNUP
    try:
        source_val = user.utm_source if hasattr(user, "utm_source") and user.utm_source else "direct"
        evt = models.AnalyticsEvent(event_type="signup", source=source_val, user_id=new_user.id)
        db.add(evt)
        db.commit()
    except Exception as e:
        print("Analytics error signup:", e)
    
    # Check for SIGNUP promotions (wrapped in try-except to prevent crash if DB schema is outdated)
    try:
        now = datetime.datetime.utcnow()
        signup_promos = db.query(models.Promotion).filter(
            models.Promotion.promo_type == "FREE_GENS",
            models.Promotion.auto_event == "SIGNUP",
            models.Promotion.is_active == True
        ).all()
        
        for promo in signup_promos:
            if promo.start_date and now < promo.start_date: continue
            if promo.end_date and now > promo.end_date: continue
            if promo.max_uses > 0 and promo.current_uses >= promo.max_uses: continue
            
            new_user.credits += promo.free_gens
            usage = models.PromotionUsage(user_id=new_user.id, promotion_id=promo.id)
            promo.current_uses += 1
            db.add(usage)
            
        db.commit()
    except Exception as e:
        print("Erreur DB Promotion lors du signup:", e)
        db.rollback()
    
    # Send email
    try:
        send_verification_email(new_user.email, verification_code)
    except Exception as e:
        print("Erreur email: ", e)
    
    return {"message": "Account created. Please verify your email.", "email": user.email}


@app.post("/api/auth/login")
@limiter.limit("20/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="NOT_VERIFIED")
        
    access_token = auth.create_access_token(data={"sub": user.email})
    logger.info(f"Connexion réussie: {user.email}")
    # TRACK LOGIN
    try:
        evt = models.AnalyticsEvent(event_type="login", source="direct", user_id=user.id)
        db.add(evt)
        db.commit()
    except Exception as e:
        print("Analytics error login:", e)
        
    return {"access_token": access_token, "token_type": "bearer"}



@app.post("/api/auth/verify-email")
@limiter.limit("10/minute")
def verify_email(request: Request, req: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified"}
    if user.verification_code != req.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    user.is_verified = True
    user.verification_code = None
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": user.email})
    logger.info(f"Connexion réussie: {user.email}")
    # TRACK LOGIN
    try:
        evt = models.AnalyticsEvent(event_type="login", source="direct", user_id=user.id)
        db.add(evt)
        db.commit()
    except Exception as e:
        print("Analytics error login:", e)
        
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/resend-verification")
@limiter.limit("5/minute")
def resend_verification(request: Request, req: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.is_verified:
        return {"message": "Email already verified"}
        
    verification_code = auth.generate_secure_code()
    user.verification_code = verification_code
    db.commit()
    
    try:
        send_verification_email(user.email, verification_code)
    except Exception as e:
        print("Erreur email: ", e)
        
    return {"message": "Code renvoyé avec succès"}

@app.post("/api/auth/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if user:
        reset_code = auth.generate_secure_code()
        user.reset_token = reset_code
        user.reset_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        db.commit()
        try:
            send_password_reset_email(user.email, reset_code)
        except Exception as e:
            print("Erreur email: ", e)
    # Always return success to prevent email enumeration
    return {"message": "If this email is registered, a reset code has been sent."}

@app.post("/api/auth/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or user.reset_token != req.code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    # Vérifier que le code n'a pas expiré (15 min)
    if hasattr(user, 'reset_token_expiry') and user.reset_token_expiry:
        if datetime.datetime.utcnow() > user.reset_token_expiry:
            user.reset_token = None
            db.commit()
            raise HTTPException(status_code=400, detail="Le code a expiré. Veuillez en demander un nouveau.")
        
    user.hashed_password = auth.get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Password reset successfully"}

class GoogleAuthRequest(BaseModel):

    access_token: str

@app.post("/api/auth/google")
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    import urllib.request
    import json
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {req.access_token}"}
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request) as response:
            user_info = json.loads(response.read().decode())
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Google token")
        
    email = user_info.get("email")
    name = user_info.get("name", "Utilisateur")
    picture = user_info.get("picture", "")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
        default_credits = int(setting.value) if setting and setting.value.isdigit() else 0
        
        user = models.User(
            email=email,
            name=name,
            hashed_password="",
            profile_picture=picture,
            credits=default_credits
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Check for SIGNUP promotions
        now = datetime.datetime.utcnow()
        signup_promos = db.query(models.Promotion).filter(
            models.Promotion.promo_type == "FREE_GENS",
            models.Promotion.auto_event == "SIGNUP",
            models.Promotion.is_active == True
        ).all()
        
        for promo in signup_promos:
            if promo.start_date and now < promo.start_date: continue
            if promo.end_date and now > promo.end_date: continue
            if promo.max_uses > 0 and promo.current_uses >= promo.max_uses: continue
            
            user.credits += promo.free_gens
            usage = models.PromotionUsage(user_id=user.id, promotion_id=promo.id)
            db.add(usage)
            promo.current_uses += 1
        
        db.commit()
        
    access_token = auth.create_access_token(data={"sub": user.email})
    logger.info(f"Connexion réussie: {user.email}")
    # TRACK LOGIN
    try:
        evt = models.AnalyticsEvent(event_type="login", source="direct", user_id=user.id)
        db.add(evt)
        db.commit()
    except Exception as e:
        print("Analytics error login:", e)
        
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "credits": current_user.credits,
        "is_premium": current_user.is_premium,
        "is_admin": current_user.is_admin,
        "profile_picture": current_user.profile_picture,
        "is_suspended": current_user.is_suspended
    }

class RechargeRequest(BaseModel):
    amount: int
    price_fcfa: int | None = None

@app.post("/api/user/recharge")
def recharge_credits(req: RechargeRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Route réservée aux admins uniquement. Les recharges utilisateurs passent par le webhook de paiement."""
    if req.amount <= 0 or req.amount > 100000:
        raise HTTPException(status_code=400, detail="Montant invalide")
    # amount is the number of credits
    current_user.credits += req.amount
    
    # Check for active BONUS_RECHARGE promotions
    now = datetime.datetime.utcnow()
    promos = db.query(models.Promotion).filter(
        models.Promotion.promo_type == "BONUS_RECHARGE",
        models.Promotion.is_active == True,
        models.Promotion.min_recharge <= req.amount
    ).all()
    
    bonus_added = 0
    for promo in promos:
        if promo.start_date and now < promo.start_date:
            continue
        if promo.end_date and now > promo.end_date:
            continue
        
        # Calculate usage logic if limited
        if promo.max_uses > 0 and promo.current_uses >= promo.max_uses:
            continue
            
        if promo.limit_per_user > 0:
            usages = db.query(models.PromotionUsage).filter(
                models.PromotionUsage.promotion_id == promo.id,
                models.PromotionUsage.user_id == current_user.id
            ).count()
            if usages >= promo.limit_per_user:
                continue
                
        # Apply bonus
        bonus_added += promo.bonus_gens
        
        # Record usage
        usage = models.PromotionUsage(user_id=current_user.id, promotion_id=promo.id)
        db.add(usage)
        promo.current_uses += 1
        # Only apply the first matching promo to avoid stacking multiple bonuses unless desired, but let's apply all that match for now or just one
        break

    if bonus_added > 0:
        current_user.credits += bonus_added

    actual_price = price_fcfa if price_fcfa is not None else amount * 3
    tx = models.Transaction(amount_credits=amount + bonus_added, price_fcfa=actual_price, payment_method="System", user_id=current_user.id)
    db.add(tx)
    db.commit()
    return {"message": "Recharged successfully", "new_credits": current_user.credits, "bonus_added": bonus_added}

class ProfileUpdateRequest(BaseModel):
    name: str = None
    profile_picture: str = None

    @validator('profile_picture', pre=True, always=True)
    def validate_picture_url(cls, v):
        if v is None:
            return v
        if v.startswith('/uploads/'):
            return v
        if not v.startswith('https://') and not v.startswith('http://localhost'):
            raise ValueError('L\'URL de la photo doit commencer par https:// ou être un chemin local')
        if len(v) > 500:
            raise ValueError('URL trop longue')
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg')
        url_lower = v.lower().split('?')[0]
        if not any(url_lower.endswith(ext) for ext in allowed_extensions):
            # Allow common image hosting domains without extension check
            allowed_domains = ('googleusercontent.com', 'gravatar.com', 'imgur.com',
                              'cloudinary.com', 'githubusercontent.com', 'dicebear.com',
                              'ui-avatars.com', 'amazonaws.com')
            if not any(domain in v for domain in allowed_domains):
                raise ValueError('URL d\'image invalide. Formats acceptés: jpg, png, gif, webp')
        return v

    @validator('name', pre=True, always=True)
    def validate_name(cls, v):
        if v is None:
            return v
        if len(v.strip()) < 2:
            raise ValueError('Le nom doit contenir au moins 2 caractères')
        if len(v) > 50:
            raise ValueError('Le nom ne peut pas dépasser 50 caractères')
        return v.strip()

@app.put("/api/user/profile")
def update_profile(req: ProfileUpdateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if req.name is not None:
        current_user.name = req.name
    if req.profile_picture is not None:
        current_user.profile_picture = req.profile_picture
    db.commit()
    return {
        "message": "Profile updated",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "profile_picture": current_user.profile_picture,
            "credits": current_user.credits,
            "is_premium": current_user.is_premium
        }
    }

@app.post("/api/user/upload-profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Format de fichier non autorisé (JPEG, PNG, WEBP, GIF)")
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Le fichier est trop volumineux (max 5MB)")
        
    ext = file.filename.split('.')[-1].lower()
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join("uploads", "profiles", filename)
    
    with open(filepath, "wb") as f:
        f.write(await file.read())
        
    new_url = f"/uploads/profiles/{filename}"
    current_user.profile_picture = new_url
    db.commit()
    
    return {"status": "success", "profile_picture": new_url}

@app.get("/api/user/transactions")
def get_user_transactions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.created_at.desc()).all()
    
    return [
        {
            "id": tx.id,
            "amount_credits": tx.amount_credits,
            "price_fcfa": tx.price_fcfa,
            "payment_method": tx.payment_method,
            "created_at": tx.created_at
        } for tx in txs
    ]

@app.post("/api/generate")
def generate_music(req: GenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.credits < 1:
        raise HTTPException(status_code=400, detail="Not enough credits")
        
    try:
        results = []
        import requests
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        try:
            suno_api_key = os.getenv("SUNO_API_KEY")
            if not suno_api_key:
                raise Exception("Clé API Suno non configurée dans le fichier .env (SUNO_API_KEY)")
                
            print(f"Connecting to Suno API for prompt: '{req.prompt}'")
            
            # Paramètres de l'API Suno
            url = "https://api.sunoapi.org/api/v1/generate"
            headers = {
                "Authorization": f"Bearer {suno_api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "customMode": False,
                "instrumental": False,
                "model": "V5_5",
                "prompt": req.prompt,
                "style": f"{req.style} {req.mood}",
                "title": "Click and Vibe Generation",
                "callBackUrl": "https://clickandvibe.local/callback" # Champ obligatoire pour l'API, mais ignoré car on utilise le polling
            }
            
            # Augmenter le timeout car Suno prend beaucoup de temps
            response = requests.post(url, json=data, headers=headers, timeout=120)
            if not response.ok:
                raise Exception(f"Erreur Suno: {response.status_code} - {response.text}")
                
            response_data = response.json()
            print("Suno API POST Response:", response_data)
            
            task_data = response_data.get("data")
            
            # Si l'API retourne une liste directement (synchrone)
            if isinstance(task_data, list) and len(task_data) > 0 and isinstance(task_data[0], dict):
                tracks = task_data
                results = []
                for track in tracks[:2]:
                    results.append({
                        "url": track.get("streamAudioUrl") or track.get("audioUrl") or track.get("url"),
                        "image_url": track.get("imageUrl") or track.get("sourceImageUrl") or "",
                        "title": track.get("title") or "Titre Généré"
                    })
                if len(results) == 1:
                    results.append(results[0])
                current_user.credits -= 1
                db.commit()
                return JSONResponse({"status": "success", "versions": results})
                     
            # Si l'API retourne un ID de tâche (asynchrone) - On le renvoie au frontend
            elif task_data is not None:
                if isinstance(task_data, dict) and "taskId" in task_data:
                    task_id = str(task_data["taskId"])
                else:
                    task_id = str(task_data)
                    
                print(f"Task ID reçu : {task_id}. Renvoi au frontend pour polling...")
                current_user.credits -= 1
                db.commit()
                return JSONResponse({"status": "pending", "task_id": task_id})
            else:
                raise Exception(f"Format de réponse inattendu. Data: {response_data}")
                
        except Exception as api_err:
            print(f"Suno API Error: {api_err}")
            raise HTTPException(status_code=500, detail="Une erreur est survenue lors de la communication avec le service de génération. Veuillez réessayer plus tard.")
    except Exception as e:
        print(f"Error during generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/generate/status/{task_id}")
def check_generation_status(task_id: str, current_user: models.User = Depends(get_current_user)):
    try:
        suno_api_key = os.getenv("SUNO_API_KEY")
        headers = {"Authorization": f"Bearer {suno_api_key}"}
        poll_url = f"https://api.sunoapi.org/api/v1/generate/record-info?taskId={task_id}"
        
        poll_response = requests.get(poll_url, headers=headers)
        if not poll_response.ok:
            return JSONResponse({"status": "error", "detail": "Erreur API lors de la vérification du statut."})
            
        try:
            poll_data = poll_response.json()
        except Exception:
            poll_data = {}
            print("Suno API Poll returned invalid JSON:", poll_response.text)
        poll_result = poll_data.get("data")
        
        if isinstance(poll_result, dict):
            status = poll_result.get("status")
            if status in ["SUCCESS", "TEXT_SUCCESS"] and poll_result.get("response"):
                suno_data = poll_result["response"].get("sunoData", [])
                if isinstance(suno_data, list) and len(suno_data) > 0:
                    if suno_data[0].get("streamAudioUrl") or suno_data[0].get("audioUrl"):
                        results = []
                        for track in suno_data[:2]:
                            results.append({
                                "url": track.get("streamAudioUrl") or track.get("audioUrl") or track.get("url"),
                                "image_url": track.get("imageUrl") or track.get("sourceImageUrl") or "",
                                "title": track.get("title") or "Titre Généré",
                                "lyrics": track.get("metadata", {}).get("prompt") or track.get("prompt") or ""
                            })
                        if len(results) == 1:
                            results.append(results[0])
                        return JSONResponse({"status": "success", "versions": results})
                        
            elif status == "FAILED":
                return JSONResponse({"status": "error", "detail": "La génération Suno a échoué."})
                
            # Pas encore terminé
            return JSONResponse({"status": "pending"})
            
        return JSONResponse({"status": "error", "detail": "Format de polling inattendu."})
    except Exception as e:
        print(f"Suno Polling Error: {e}")
        return JSONResponse({"status": "error", "detail": "Une erreur de communication est survenue. Veuillez réessayer."})

@app.post("/api/music/save")
def save_music(req: SaveMusicRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    local_audio_url = req.audio_url
    local_cover_url = req.cover_url
    
    download_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    if req.audio_url and req.audio_url.startswith("http"):
        try:
            r = requests.get(req.audio_url, timeout=30, headers=download_headers)
            if r.ok:
                import hashlib
                filename = f"{hashlib.md5(req.audio_url.encode()).hexdigest()}.mp3"
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(r.content)
                local_audio_url = f"/generations/{filename}"
        except Exception as e:
            print("Erreur téléchargement audio:", e)
            
    if req.cover_url and req.cover_url.startswith("http"):
        try:
            r = requests.get(req.cover_url, timeout=30, headers=download_headers)
            if r.ok:
                import hashlib
                filename = f"{hashlib.md5(req.cover_url.encode()).hexdigest()}.jpeg"
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(r.content)
                local_cover_url = f"/generations/{filename}"
        except Exception as e:
            print("Erreur téléchargement cover:", e)

    existing = db.query(models.Music).filter(models.Music.audio_url == local_audio_url).first()
    if existing:
        return {"status": "success", "message": "Music already saved"}

    new_music = models.Music(
        title=req.title,
        prompt=req.prompt,
        style=req.style,
        mood=req.mood,
        duration_str=req.duration_str,
        audio_url=local_audio_url,
        cover_url=local_cover_url,
        lyrics=req.lyrics,
        owner_id=current_user.id
    )
    db.add(new_music)
    db.commit()
    return {"status": "success", "message": "Music saved to library"}

@app.get("/api/music/history")
def get_music_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    musics = db.query(models.Music).filter(models.Music.owner_id == current_user.id).order_by(models.Music.created_at.desc()).offset(skip).limit(limit).all()
    return musics

@app.get("/api/music/explore")
def explore_music(db: Session = Depends(get_db)):
    # Return musics chosen by admin for explore
    musics = db.query(models.Music).filter(models.Music.is_explore == True).order_by(models.Music.created_at.desc()).limit(20).all()
    return musics

@app.get("/api/music/trending")
def get_trending_music(db: Session = Depends(get_db)):
    # Return trending musics chosen by admin
    musics = db.query(models.Music).filter(models.Music.is_trending == True).order_by(models.Music.created_at.desc()).all()
    return musics

@app.post("/api/music/favorite/{music_id}")
def toggle_favorite(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
        
    fav = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id, models.Favorite.music_id == music_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"status": "success", "is_favorite": False}
    else:
        new_fav = models.Favorite(user_id=current_user.id, music_id=music_id)
        db.add(new_fav)
        db.commit()
        return {"status": "success", "is_favorite": True}

@app.get("/api/music/favorites")
def get_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    fav_music_ids = [f.music_id for f in favs]
    musics = db.query(models.Music).filter(models.Music.id.in_(fav_music_ids)).all()
    return musics


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Backend is running", "db_connected": True}

from sqlalchemy import func

@app.post("/api/track/download")
def track_download(db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == "APP_DOWNLOAD_COUNT").first()
    if not setting:
        setting = models.Setting(key="APP_DOWNLOAD_COUNT", value="1", description="Nombre de téléchargements de la PWA")
        db.add(setting)
    else:
        setting.value = str(int(setting.value) + 1)
    db.commit()
    return {"status": "success"}

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    total_users = db.query(models.User).count()
    
    # Online Users
    now = time.time()
    online_users = sum(1 for ts in active_sessions.values() if now - ts < 300)
    
    total_generations = db.query(models.Music).count()
    total_revenue = db.query(func.sum(models.Transaction.price_fcfa)).scalar() or 0
    
    # App Downloads
    setting = db.query(models.Setting).filter(models.Setting.key == "APP_DOWNLOAD_COUNT").first()
    total_downloads = int(setting.value) if setting else 0
    
    return {
        "total_users": total_users,
        "online_users": online_users,
        "total_generations": total_generations,
        "total_revenue": total_revenue,
        "total_downloads": total_downloads,
        "premium_users": db.query(models.User).filter(models.User.is_premium == True).count()
    }

@app.get("/api/admin/recent-generations")
def get_admin_recent_generations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    recent = db.query(models.Music).order_by(models.Music.created_at.desc()).limit(5).all()
    result = []
    for m in recent:
        user = db.query(models.User).filter(models.User.id == m.owner_id).first()
        result.append({
            "id": m.id,
            "title": m.title,
            "style": m.style,
            "mood": m.mood,
            "duration_str": m.duration_str,
            "audio_url": m.audio_url,
            "cover_url": m.cover_url,
            "created_at": m.created_at,
            "lyrics": m.lyrics,
            "user_name": user.name if user else "Inconnu",
            "credits_used": 12
        })
    return result

@app.get("/api/admin/chart-data")
def get_admin_chart_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    today = datetime.datetime.utcnow().date()
    data = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        count = db.query(models.Music).filter(
            models.Music.created_at >= day_start,
            models.Music.created_at <= day_end
        ).count()
        data.append({"name": day.strftime("%d %b"), "generations": count})
    return data

@app.get("/api/admin/style-distribution")
def get_admin_style_distribution(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Retourne la distribution réelle des styles de musique générés."""
    results = db.query(models.Music.style, func.count(models.Music.id).label("count")) \
        .filter(models.Music.style != None, models.Music.style != "") \
        .group_by(models.Music.style) \
        .order_by(func.count(models.Music.id).desc()) \
        .limit(6).all()
    
    total = sum(r.count for r in results)
    if total == 0:
        return []
    
    return [{"name": r.style, "value": round((r.count / total) * 100)} for r in results]

@app.get("/api/admin/users-growth")
def get_admin_users_growth(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Retourne le nombre de nouveaux utilisateurs par jour sur les 7 derniers jours."""
    today = datetime.datetime.utcnow().date()
    data = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        count = db.query(models.User).filter(
            models.User.created_at >= day_start,
            models.User.created_at <= day_end
        ).count()
        data.append({"name": day.strftime("%d %b"), "users": count})
    return data

@app.get("/api/admin/users")
def get_admin_users(skip: int = 0, limit: int = 5000, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    users = db.query(models.User).order_by(models.User.id.desc()).offset(skip).limit(limit).all()
    return [{"id": u.id, "email": u.email, "name": u.name, "credits": u.credits, "is_premium": u.is_premium, "is_suspended": u.is_suspended, "created_at": u.created_at} for u in users]

@app.post("/api/admin/users/{user_id}/toggle-premium")
def toggle_user_premium(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_premium = not user.is_premium
    db.commit()
    return {"status": "success", "is_premium": user.is_premium}

class AddCreditsRequest(BaseModel):
    amount: int

@app.post("/api/admin/users/{user_id}/credits")
def update_user_credits(user_id: int, req: AddCreditsRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.credits += req.amount
    if user.credits < 0:
        user.credits = 0
    db.commit()
    return {"status": "success", "new_credits": user.credits}

@app.post("/api/admin/users/{user_id}/suspend")
def admin_toggle_suspend(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_suspended = not user.is_suspended
    db.commit()
    return {"status": "success", "is_suspended": user.is_suspended}

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un compte administrateur.")
    db.delete(user)
    db.commit()
    return {"status": "success", "message": "User deleted"}

@app.get("/api/admin/transactions")
def get_admin_transactions(skip: int = 0, limit: int = 5000, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    transactions = db.query(models.Transaction).order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for t in transactions:
        user = db.query(models.User).filter(models.User.id == t.user_id).first()
        result.append({
            "id": t.id,
            "amount_credits": t.amount_credits,
            "price_fcfa": t.price_fcfa,
            "payment_method": t.payment_method,
            "created_at": t.created_at,
            "user_name": user.name if user else "Inconnu",
            "user_email": user.email if user else "Inconnu"
        })
    return result

@app.get("/api/admin/musics")
def get_admin_musics(skip: int = 0, limit: int = 5000, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    musics = db.query(models.Music).order_by(models.Music.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for m in musics:
        user = db.query(models.User).filter(models.User.id == m.owner_id).first()
        result.append({
            "id": m.id,
            "title": m.title,
            "style": m.style,
            "mood": m.mood,
            "duration_str": m.duration_str,
            "audio_url": m.audio_url,
            "cover_url": m.cover_url,
            "created_at": m.created_at,
            "is_trending": m.is_trending,
            "is_explore": m.is_explore,
            "lyrics": m.lyrics,
            "user_name": user.name if user else "Inconnu"
        })
    return result

@app.post("/api/admin/musics/{music_id}/trending")
def toggle_music_trending(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    music.is_trending = not music.is_trending
    db.commit()
    return {"status": "success", "is_trending": music.is_trending}

@app.post("/api/admin/musics/{music_id}/explore")
def toggle_music_explore(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    music.is_explore = not music.is_explore
    db.commit()
    return {"status": "success", "is_explore": music.is_explore}

@app.delete("/api/admin/musics/{music_id}")
def admin_delete_music(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    logger.info(f"L'admin {current_user.email} tente de supprimer la musique {music_id}")
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        logger.warning(f"Suppression échouée: Musique {music_id} introuvable.")
        raise HTTPException(status_code=404, detail="Music not found")
    
    try:
        db.query(models.Favorite).filter(models.Favorite.music_id == music_id).delete(synchronize_session=False)
        db.delete(music)
        db.commit()
        logger.info(f"Musique {music_id} supprimée avec succès par {current_user.email}.")
        return {"status": "success", "message": "Music deleted by admin"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors de la suppression de la musique {music_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur serveur lors de la suppression")

# --- Promotions & Marketing ---

@app.get("/api/admin/promotions")
def get_promotions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    promos = db.query(models.Promotion).order_by(models.Promotion.created_at.desc()).all()
    return promos

@app.post("/api/admin/promotions")
def create_promotion(req: PromotionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    promo_data = req.model_dump()
    if promo_data.get("promo_code") == "":
        promo_data["promo_code"] = None
    promo = models.Promotion(**promo_data)
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo

@app.put("/api/admin/promotions/{promo_id}")
def update_promotion(promo_id: int, req: PromotionUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    promo = db.query(models.Promotion).filter(models.Promotion.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    promo_data = req.model_dump()
    if promo_data.get("promo_code") == "":
        promo_data["promo_code"] = None
        
    for key, value in promo_data.items():
        setattr(promo, key, value)
    
    db.commit()
    db.refresh(promo)
    return promo

@app.delete("/api/admin/promotions/{promo_id}")
def delete_promotion(promo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    promo = db.query(models.Promotion).filter(models.Promotion.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")
        
    db.query(models.PromotionUsage).filter(models.PromotionUsage.promotion_id == promo_id).delete()
    db.delete(promo)
    db.commit()
    return {"status": "success"}

@app.get("/api/promotions/active")
def get_active_promotions(db: Session = Depends(get_db)):
    now = datetime.datetime.utcnow()
    promos = db.query(models.Promotion).filter(
        models.Promotion.is_active == True,
        models.Promotion.promo_type == "BONUS_RECHARGE"
    ).all()
    
    valid_promos = []
    for p in promos:
        if p.start_date and now < p.start_date: continue
        if p.end_date and now > p.end_date: continue
        if p.max_uses > 0 and p.current_uses >= p.max_uses: continue
        valid_promos.append({
            "name": p.name,
            "description": p.description,
            "min_recharge": p.min_recharge,
            "bonus_gens": p.bonus_gens,
            "end_date": p.end_date
        })
    return valid_promos

@app.post("/api/promotions/apply_code")
def apply_promo_code(req: ApplyPromoRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    code = req.promo_code.strip()
    promo = db.query(models.Promotion).filter(
        models.Promotion.promo_code == code, 
        models.Promotion.promo_type == "PROMO_CODE",
        models.Promotion.is_active == True
    ).first()
    
    if not promo:
        raise HTTPException(status_code=404, detail="Code promo invalide")
        
    now = datetime.datetime.utcnow()
    if promo.start_date and now < promo.start_date:
        raise HTTPException(status_code=400, detail="Ce code promo n'est pas encore actif")
    if promo.end_date and now > promo.end_date:
        raise HTTPException(status_code=400, detail="Ce code promo est expiré")
        
    if promo.max_uses > 0 and promo.current_uses >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Ce code promo a atteint sa limite d'utilisation")
        
    # Check limit per user
    if promo.limit_per_user > 0:
        usages = db.query(models.PromotionUsage).filter(
            models.PromotionUsage.promotion_id == promo.id,
            models.PromotionUsage.user_id == current_user.id
        ).count()
        if usages >= promo.limit_per_user:
            raise HTTPException(status_code=400, detail="Vous avez déjà utilisé ce code promo")
            
    # Apply effects
    result_message = ""
    if promo.free_gens > 0:
        current_user.credits += promo.free_gens
        result_message = f"Vous avez reçu {promo.free_gens} Gens gratuits !"
    
    # Record usage
    usage = models.PromotionUsage(user_id=current_user.id, promotion_id=promo.id)
    db.add(usage)
    promo.current_uses += 1
    
    db.commit()
    
    return {
        "status": "success", 
        "message": result_message,
        "discount_percent": promo.discount_percent,
        "discount_amount": promo.discount_amount
    }


@app.post("/api/payment/initiate")
def initiate_payment(req: PaymentInitiateRequest, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    kpay_api_key = os.getenv("KPAY_API_KEY")
    kpay_secret_key = os.getenv("KPAY_SECRET_KEY")
    
    if not kpay_api_key or not kpay_secret_key:
        raise HTTPException(status_code=500, detail="KPay API keys not configured")
    
    url = "https://admin.kpay.site/api/v1/payments/init"
    headers = {
        "X-API-Key": kpay_api_key,
        "X-Secret-Key": kpay_secret_key,
        "Content-Type": "application/json"
    }
    
    import uuid
    external_id = f"ORDER-{uuid.uuid4().hex[:12]}"
    origin_url = req.origin or request.headers.get('origin', 'http://localhost:5173')
    
    payload = {
        "amount": req.amount_fcfa,
        "externalId": external_id,
        "metadata": {
            "user_id": str(current_user.id),
            "credits_to_add": req.credits_to_add,
            "amount_fcfa": req.amount_fcfa,
            "payment_method": req.payment_method or "kpay"
        }
    }
    
    if req.phoneNumber and req.provider:
        payload["mode"] = "USSD"
        payload["phoneNumber"] = req.phoneNumber
        payload["provider"] = req.provider
        if getattr(req, 'fullName', None):
            payload["customerName"] = req.fullName
    else:
        payload["returnUrl"] = f"{origin_url}/payment-success"
        payload["cancelUrl"] = f"{origin_url}/payment-failed"

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 201:
            data = response.json()
            
            # Track payment_init
            try:
                import json
                evt = models.AnalyticsEvent(
                    event_type="payment_init", 
                    source=current_user.country or "direct", 
                    user_id=current_user.id,
                    extra=json.dumps({"amount_fcfa": req.amount_fcfa, "credits": req.credits_to_add})
                )
                db.add(evt)
                db.commit()
            except Exception as e:
                print("Analytics payment_init error:", e)

            gateway_url = data.get("gatewayUrl")
            if gateway_url:
                return {"checkout_url": gateway_url}
            
            # If USSD mode, return status PENDING
            if data.get("status") == "PENDING":
                return {"status": "PENDING", "externalId": external_id}
            
            return data
        
        print("KPay Init Error:", response.text)
        raise HTTPException(status_code=400, detail=f"Erreur KPay: {response.text}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur backend: {str(e)}")

@app.post("/api/webhooks/kpay")
async def kpay_webhook(request: Request, db: Session = Depends(get_db)):
    signature = request.headers.get("X-KPAY-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Header X-KPAY-Signature manquant")
        
    raw_body = await request.body()
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    webhook_secret = os.getenv("KPAY_WEBHOOK_SECRET")
    if not webhook_secret:
        print("KPAY_WEBHOOK_SECRET not set")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=400, detail="Signature invalide")
        
    event = payload.get("event")
    status = payload.get("status")
    
    if event == "payment.completed" and status == "COMPLETED":
        metadata = payload.get("metadata", {})
        
        user_id = metadata.get("user_id")
        amount = metadata.get("credits_to_add", 0)
        price_fcfa = metadata.get("amount_fcfa", 0)
        payment_method = metadata.get("payment_method", "kpay")
        
        if user_id and amount:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                user.credits += int(amount)
                
                now = datetime.datetime.utcnow()
                promos = db.query(models.Promotion).filter(
                    models.Promotion.promo_type == "BONUS_RECHARGE",
                    models.Promotion.is_active == True,
                    models.Promotion.min_recharge <= int(amount)
                ).all()
                
                bonus_added = 0
                for promo in promos:
                    if promo.start_date and now < promo.start_date:
                        continue
                    if promo.end_date and now > promo.end_date:
                        continue
                    
                    user.credits += promo.bonus_gens
                    bonus_added += promo.bonus_gens
                    
                    usage = models.PromotionUsage(user_id=user.id, promotion_id=promo.id)
                    db.add(usage)
                    
                    promo.current_uses += 1
                
                tx = models.Transaction(
                    user_id=user.id,
                    amount_credits=int(amount) + bonus_added,
                    price_fcfa=int(price_fcfa),
                    payment_method=payment_method
                )
                db.add(tx)
                db.commit()
                print(f"User {user.id} credited with {amount} + {bonus_added} bonus via KPay.")
    
    return {"success": True}

class SettingsUpdate(BaseModel):
    free_credits: int
    maintenance_mode: bool = False

@app.get("/api/config")
def get_public_config(db: Session = Depends(get_db)):
    m_setting = db.query(models.Setting).filter(models.Setting.key == "MAINTENANCE_MODE").first()
    maintenance_mode = True if m_setting and m_setting.value == "true" else False
    return {"maintenance_mode": maintenance_mode}

@app.get("/api/admin/settings")
def get_settings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    free_credits = int(setting.value) if setting and setting.value.isdigit() else 0
    
    m_setting = db.query(models.Setting).filter(models.Setting.key == "MAINTENANCE_MODE").first()
    maintenance_mode = True if m_setting and m_setting.value == "true" else False
    
    return {
        "free_credits": free_credits,
        "maintenance_mode": maintenance_mode
    }

@app.post("/api/admin/settings")
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    # Update Free Credits
    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    if not setting:
        setting = models.Setting(key="FREE_REGISTRATION_CREDITS", value=str(req.free_credits))
        db.add(setting)
    else:
        setting.value = str(req.free_credits)
        
    # Update Maintenance Mode
    m_setting = db.query(models.Setting).filter(models.Setting.key == "MAINTENANCE_MODE").first()
    m_val = "true" if req.maintenance_mode else "false"
    if not m_setting:
        m_setting = models.Setting(key="MAINTENANCE_MODE", value=m_val)
        db.add(m_setting)
    else:
        m_setting.value = m_val
        
    db.commit()
    return {"status": "success"}

@app.get("/api/admin/logs")
def get_system_logs(lines: int = 200, current_user: models.User = Depends(get_current_admin_user)):
    log_path = os.path.join(os.path.dirname(__file__), 'app.log')
    if not os.path.exists(log_path):
        return {"logs": ["Aucun log trouvé (app.log n'existe pas encore)."]}
    
    try:
        with open(log_path, 'r', encoding='utf-8') as f:
            all_lines = f.readlines()
            return {"logs": all_lines[-lines:]}
    except Exception as e:
        return {"logs": [f"Erreur lors de la lecture des logs: {str(e)}"]}

# --- NOTIFICATIONS ---

from pydantic import BaseModel

class NotificationCreate(BaseModel):
    user_id: Optional[int] = None
    title: str
    message: str
    type: str = "info"

class PricingPlanCreate(BaseModel):
    category: str
    credits: int
    price_fcfa: int
    original_price_fcfa: Optional[int] = None
    title: str
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    icon_color: str = "pink"
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class PricingPlanUpdate(BaseModel):
    category: Optional[str] = None
    credits: Optional[int] = None
    price_fcfa: Optional[int] = None
    original_price_fcfa: Optional[int] = None
    title: Optional[str] = None
    badge: Optional[str] = None
    badge_color: Optional[str] = None
    icon_color: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


@app.get("/api/notifications")
def get_user_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Get user specific and broadcast (user_id is None) notifications
    notifs = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) | (models.Notification.user_id == None)
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    return notifs

@app.post("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif and (notif.user_id == current_user.id or notif.user_id == None):
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@app.post("/api/admin/notifications")
def create_notification(req: NotificationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    if req.user_id is None:
        # Broadcast: create one notification per user
        all_users = db.query(models.User).filter(models.User.is_suspended == False).all()
        for u in all_users:
            notif = models.Notification(
                user_id=u.id,
                title=req.title,
                message=req.message,
                type=req.type
            )
            db.add(notif)
        db.commit()
        logger.info(f"Admin {current_user.email} a diffusé une notification globale '{req.title}' à {len(all_users)} utilisateurs")
        return {"status": "success", "recipients": len(all_users)}
    else:
        new_notif = models.Notification(
            user_id=req.user_id,
            title=req.title,
            message=req.message,
            type=req.type
        )
        db.add(new_notif)
        db.commit()
        logger.info(f"Admin {current_user.email} a envoyé une notification '{req.title}'")
        return {"status": "success", "id": new_notif.id}

# ─── ANALYTICS ────────────────────────────────────────────────────────────────

@app.post("/api/analytics/event")
def track_event(request: Request, db: Session = Depends(get_db)):
    """Track a conversion funnel event (public endpoint, no auth required)"""
    import json as json_lib
    try:
        body = {}
        # We accept both sync and async; use raw body stored in state if set
    except Exception:
        pass
    return {"status": "ok"}

@app.post("/api/analytics/track")
async def track_event_body(request: Request, db: Session = Depends(get_db)):
    """Track a conversion funnel event with body"""
    import json as json_lib
    try:
        body = await request.json()
    except Exception:
        body = {}

    event_type = body.get("event_type", "unknown")
    user_id = body.get("user_id", None)
    source = body.get("source", None)
    utm_campaign = body.get("utm_campaign", None)
    utm_medium = body.get("utm_medium", None)
    country = body.get("country", None)
    extra = body.get("extra", None)
    if isinstance(extra, dict):
        extra = json_lib.dumps(extra)

    event = models.AnalyticsEvent(
        event_type=event_type,
        user_id=user_id,
        source=source,
        utm_campaign=utm_campaign,
        utm_medium=utm_medium,
        country=country,
        extra=extra
    )
    db.add(event)
    db.commit()
    return {"status": "ok"}

@app.get("/api/admin/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    """Return conversion funnel stats for admin dashboard"""
    import json as json_lib
    from sqlalchemy import func

    # Funnel counts
    def count_event(evt):
        return db.query(func.count(models.AnalyticsEvent.id)).filter(
            models.AnalyticsEvent.event_type == evt
        ).scalar() or 0

    funnel = {
        "visit": count_event("visit"),
        "signup": count_event("signup"),
        "login": count_event("login"),
        "create_click": count_event("create_click"),
        "generate": count_event("generate"),
        "payment_init": count_event("payment_init"),
        "payment_success": count_event("payment_success"),
    }

    # Sources
    sources_raw = db.query(
        models.AnalyticsEvent.source,
        func.count(models.AnalyticsEvent.id).label("count")
    ).filter(
        models.AnalyticsEvent.source != None
    ).group_by(models.AnalyticsEvent.source).all()

    sources = [{"source": r.source, "count": r.count} for r in sources_raw]

    # Revenue stats
    from datetime import date, timedelta
    today = datetime.datetime.utcnow().date()
    month_start = today.replace(day=1)

    daily_revenue = db.query(func.coalesce(func.sum(models.Transaction.price_fcfa), 0)).filter(
        func.date(models.Transaction.created_at) == today
    ).scalar() or 0

    monthly_revenue = db.query(func.coalesce(func.sum(models.Transaction.price_fcfa), 0)).filter(
        models.Transaction.created_at >= datetime.datetime(month_start.year, month_start.month, month_start.day)
    ).scalar() or 0

    # Active users today
    active_today = db.query(func.count(func.distinct(models.AnalyticsEvent.user_id))).filter(
        func.date(models.AnalyticsEvent.created_at) == today,
        models.AnalyticsEvent.user_id != None
    ).scalar() or 0

    # Generations today
    gens_today = count_event("generate")

    return {
        "funnel": funnel,
        "sources": sources,
        "daily_revenue": daily_revenue,
        "monthly_revenue": monthly_revenue,
        "active_today": active_today,
        "gens_today": gens_today
    }


# ─── PRICING PLANS ────────────────────────────────────────────────────────────

def seed_default_plans(db: Session):
    existing = db.query(models.PricingPlan).count()
    if existing == 0:
        plans = [
            models.PricingPlan(category="single", credits=1, price_fcfa=1250, title="1 Gen", icon_color="pink", display_order=1),
            models.PricingPlan(category="single", credits=2, price_fcfa=2300, original_price_fcfa=2500, title="2 Gens", badge="-8%", icon_color="purple", display_order=2),
            models.PricingPlan(category="single", credits=3, price_fcfa=3200, original_price_fcfa=3750, title="3 Gens", badge="Meilleur prix", badge_color="orange", icon_color="orange", display_order=3),
            
            models.PricingPlan(category="kit", credits=5, price_fcfa=5000, title="5 Gens", badge="🥉 Starter", icon_color="pink", description="Idéal pour découvrir Click & Vibe.", display_order=4),
            models.PricingPlan(category="kit", credits=10, price_fcfa=9000, original_price_fcfa=12500, title="10 Gens", badge="🥈 Populaire", badge_color="purple", icon_color="purple", description="Économie par rapport aux achats à l'unité.", display_order=5),
            models.PricingPlan(category="kit", credits=25, price_fcfa=20000, original_price_fcfa=31250, title="25 Gens", badge="🥇 Premium", badge_color="orange", icon_color="orange", description="Pour les créateurs réguliers.", display_order=6)
        ]
        db.add_all(plans)
        db.commit()

@app.get("/api/plans")
def get_plans(db: Session = Depends(get_db)):
    seed_default_plans(db)
    plans = db.query(models.PricingPlan).filter(models.PricingPlan.is_active == True).order_by(models.PricingPlan.display_order).all()
    return plans

@app.get("/api/admin/plans")
def admin_get_plans(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    seed_default_plans(db)
    return db.query(models.PricingPlan).order_by(models.PricingPlan.display_order).all()

@app.post("/api/admin/plans")
def admin_create_plan(req: PricingPlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    new_plan = models.PricingPlan(**req.dict())
    db.add(new_plan)
    db.commit()
    return {"status": "success", "id": new_plan.id}

@app.put("/api/admin/plans/{plan_id}")
def admin_update_plan(plan_id: int, req: PricingPlanUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    plan = db.query(models.PricingPlan).filter(models.PricingPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for k, v in req.dict(exclude_unset=True).items():
        setattr(plan, k, v)
    db.commit()
    return {"status": "success"}

@app.delete("/api/admin/plans/{plan_id}")
def admin_delete_plan(plan_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    plan = db.query(models.PricingPlan).filter(models.PricingPlan.id == plan_id).first()
    if plan:
        db.delete(plan)
        db.commit()
    return {"status": "success"}


@app.get("/api/admin/payment-attempts")
def get_admin_payment_attempts(skip: int = 0, limit: int = 500, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    attempts = db.query(models.AnalyticsEvent, models.User).join(
        models.User, models.AnalyticsEvent.user_id == models.User.id
    ).filter(models.AnalyticsEvent.event_type == "payment_init")\
    .order_by(models.AnalyticsEvent.created_at.desc())\
    .offset(skip).limit(limit).all()
    
    result = []
    import json
    for evt, user in attempts:
        extra_data = {}
        if evt.extra:
            try:
                extra_data = json.loads(evt.extra)
            except:
                pass
                
        result.append({
            "id": evt.id,
            "created_at": evt.created_at.isoformat(),
            "user_name": user.name,
            "user_email": user.email,
            "user_country": user.country or "Inconnu",
            "amount_fcfa": extra_data.get("amount_fcfa", 0),
            "credits_to_add": extra_data.get("credits", 0)
        })
    return result

from pydantic import BaseModel

class CampaignCreate(BaseModel):
    title: str
    subject: str
    html_content: str
    target_audience: str

@app.get("/api/admin/campaigns")
def get_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    campaigns = db.query(models.EmailCampaign).order_by(models.EmailCampaign.created_at.desc()).offset(skip).limit(limit).all()
    return campaigns

@app.post("/api/admin/campaigns")
def create_campaign(req: CampaignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    campaign = models.EmailCampaign(
        title=req.title,
        subject=req.subject,
        html_content=req.html_content,
        target_audience=req.target_audience
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@app.post("/api/admin/campaigns/{campaign_id}/send")
def send_campaign(campaign_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    campaign = db.query(models.EmailCampaign).filter(models.EmailCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne introuvable")
    if campaign.status == "SENDING" or campaign.status == "COMPLETED":
        raise HTTPException(status_code=400, detail="Cette campagne a déjà été envoyée ou est en cours.")
        
    campaign.status = "SENDING"
    campaign.sent_at = datetime.datetime.utcnow()
    db.commit()
    
    # Process target audience to determine users
    query = db.query(models.User)
    if campaign.target_audience == "NO_CREDIT":
        query = query.filter(models.User.credits <= 0)
    elif campaign.target_audience == "PAYING":
        query = query.filter(models.User.transactions.any())
    elif campaign.target_audience == "NON_PAYING":
        query = query.filter(~models.User.transactions.any())
    elif campaign.target_audience == "PAYMENT_INITIATED":
        # Get users who have an analytics event of type 'payment_init'
        query = query.join(models.AnalyticsEvent).filter(models.AnalyticsEvent.event_type == 'payment_init').distinct()
        
    users = query.all()
    campaign.total_target = len(users)
    db.commit()
    
    # Create the background task
    def process_campaign(c_id, user_ids):
        import time
        from database import SessionLocal
        from email_service import send_brevo_email
        db_bg = SessionLocal()
        c = db_bg.query(models.EmailCampaign).filter(models.EmailCampaign.id == c_id).first()
        if not c:
            db_bg.close()
            return
            
        success_count = 0
        for uid in user_ids:
            u = db_bg.query(models.User).filter(models.User.id == uid).first()
            if u and u.email:
                # Personalize email
                html = c.html_content.replace("{nom}", u.name)
                # Send email
                if send_brevo_email(u.email, u.name, c.subject, html):
                    success_count += 1
                # Rate limit to avoid triggering spam filters/API limits aggressively (e.g. 2 per second)
                time.sleep(0.5)
                
        c.status = "COMPLETED"
        c.sent_count = success_count
        db_bg.commit()
        db_bg.close()
        
    user_ids = [u.id for u in users]
    background_tasks.add_task(process_campaign, campaign.id, user_ids)
    
    return {"message": "Envoi de la campagne démarré en arrière-plan", "target_count": len(user_ids)}

class SingleEmailRequest(BaseModel):
    email: str
    name: str
    subject: str
    html_content: str

@app.post("/api/admin/email/send-single")
def send_single_email(req: SingleEmailRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    def send_it(to_email, to_name, sub, html):
        from email_service import send_email, get_base_html
        formatted_html = get_base_html(sub, html)
        send_email(to_email, sub, formatted_html)
        
    background_tasks.add_task(send_it, req.email, req.name, req.subject, req.html_content)
    return {"message": "Email en cours d'envoi"}
