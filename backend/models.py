from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, default="Utilisateur")
    profile_picture = Column(String, nullable=True)
    country = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    credits = Column(Integer, default=12)
    is_premium = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    musics = relationship("Music", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

class Music(Base):
    __tablename__ = "musics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    prompt = Column(String)
    style = Column(String)
    mood = Column(String)
    duration_str = Column(String)
    audio_url = Column(String)
    cover_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    play_count = Column(Integer, default=0)
    is_trending = Column(Boolean, default=False)
    is_explore = Column(Boolean, default=False)
    lyrics = Column(Text, nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="musics")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount_credits = Column(Integer)
    price_fcfa = Column(Integer)
    payment_method = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="transactions")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    music_id = Column(Integer, ForeignKey("musics.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    music = relationship("Music")

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="Brouillon") # Brouillon, Active, Terminée
    is_active = Column(Boolean, default=False)
    
    promo_type = Column(String) # FREE_GENS, BONUS_RECHARGE, DISCOUNT, PROMO_CODE
    
    # Specific fields based on type
    free_gens = Column(Integer, default=0)
    bonus_gens = Column(Integer, default=0)
    min_recharge = Column(Integer, default=0)
    discount_percent = Column(Integer, default=0)
    discount_amount = Column(Integer, default=0)
    promo_code = Column(String, unique=True, index=True, nullable=True)
    
    # Targeting and usage
    target_audience = Column(String, default="ALL") # ALL, NEW, PREMIUM, INACTIVE, VIP, SPECIFIC_COUNTRY, SPECIFIC_USERS
    target_country = Column(String, nullable=True)
    auto_event = Column(String, default="NONE") # NONE, SIGNUP, BIRTHDAY, REFERRAL, FIRST_RECHARGE, HOLIDAY
    
    max_uses = Column(Integer, default=0) # 0 = unlimited
    current_uses = Column(Integer, default=0)
    limit_per_user = Column(Integer, default=1) # 0 = unlimited
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PromotionUsage(Base):
    __tablename__ = "promotion_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    promotion_id = Column(Integer, ForeignKey("promotions.id"))
    used_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User")
    promotion = relationship("Promotion")
