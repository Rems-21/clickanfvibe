import os
import uuid
import datetime
import requests
import random
from email_service import send_verification_email, send_password_reset_email
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, validator
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
    print("GLOBAL EXCEPTION:", exc)
    return JSONResponse(
        status_code=400,
        content={"detail": "GLOBAL CRASH: " + str(exc), "traceback": traceback.format_exc()}
    )



# Rate limiter — protection brute force
limiter = Limiter(key_func=get_remote_address)
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
        "ALTER TABLE promotions ADD COLUMN target_country VARCHAR(255);"
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
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="NOT_VERIFIED")
        
    access_token = auth.create_access_token(data={"sub": user.email})
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
            
        poll_data = poll_response.json()
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

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    generations_count = db.query(models.Music).count()
    users_count = db.query(models.User).count()
    credits_consumed = generations_count * 12
    revenues = db.query(func.sum(models.Transaction.price_fcfa)).scalar() or 0
    premium_count = db.query(models.User).filter(models.User.is_premium == True).count()
    
    return {
        "generations": generations_count,
        "users": users_count,
        "credits": credits_consumed,
        "revenues": revenues,
        "premium_users": premium_count
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
def get_admin_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
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
def get_admin_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
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
def get_admin_musics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
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
    genius_api_key = os.getenv("GENIUS_PAY_API_KEY")
    genius_secret = os.getenv("GENIUS_PAY_SECRET")
    
    if not genius_api_key or not genius_secret:
        raise HTTPException(status_code=500, detail="Genius Pay API keys not configured")
    
    url = "https://geniuspay.ci/api/v1/merchant/payments"
    headers = {
        "X-API-Key": genius_api_key,
        "X-API-Secret": genius_secret,
        "Content-Type": "application/json"
    }
    
    payload = {
        "amount": req.amount_fcfa,
        "description": f"Recharge de {req.credits_to_add} Gens - Click & Vibe",
        "customer": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "success_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-success",
        "error_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-failed",
        "metadata": {
            "user_id": current_user.id,
            "credits_to_add": req.credits_to_add,
            "amount_fcfa": req.amount_fcfa,
            "payment_method": req.payment_method
        }
    }
    
    if req.payment_method:
        payload["payment_method"] = req.payment_method

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201 or response.status_code == 200:
        data = response.json()
        if data.get("success"):
            return {"checkout_url": data["data"].get("checkout_url") or data["data"].get("payment_url")}
    
    print("GeniusPay Init Error:", response.text)
    raise HTTPException(status_code=400, detail="Impossible d'initier le paiement avec GeniusPay.")

@app.post("/api/webhooks/geniuspay")
async def geniuspay_webhook(request: Request, db: Session = Depends(get_db)):
    signature = request.headers.get("X-Webhook-Signature")
    timestamp = request.headers.get("X-Webhook-Timestamp")
    event = request.headers.get("X-Webhook-Event")
    
    if not signature or not timestamp or not event:
        raise HTTPException(status_code=400, detail="Headers manquants")
        
    raw_body = await request.body()
    payload = await request.json()
    
    webhook_secret = os.getenv("GENIUSPAY_WEBHOOK_SECRET")
    if not webhook_secret:
        print("GENIUSPAY_WEBHOOK_SECRET not set")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
    data_str = f"{timestamp}.{raw_body.decode('utf-8')}"
    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        data_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Signature invalide")
        
    current_time = int(time.time())
    if abs(current_time - int(timestamp)) > 300:
        raise HTTPException(status_code=400, detail="Timestamp trop ancien")
        
    if event == "payment.success":
        data = payload.get("data", {})
        metadata = data.get("metadata", {})
        
        user_id = metadata.get("user_id")
        amount = metadata.get("credits_to_add", 0)
        price_fcfa = metadata.get("amount_fcfa", 0)
        payment_method = metadata.get("payment_method", "geniuspay")
        
        if user_id and amount:
            user = db.query(models.User).filter(models.User.id == user_id).first()
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
                print(f"User {user.id} credited with {amount} + {bonus_added} bonus.")
    
    return {"success": True}

class SettingsUpdate(BaseModel):
    free_credits: int

@app.get("/api/admin/settings")
def get_settings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    free_credits = int(setting.value) if setting and setting.value.isdigit() else 0
    return {"free_credits": free_credits}

@app.post("/api/admin/settings")
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    if not setting:
        setting = models.Setting(key="FREE_REGISTRATION_CREDITS", value=str(req.free_credits))
        db.add(setting)
    else:
        setting.value = str(req.free_credits)
    db.commit()
    return {"status": "success"}
