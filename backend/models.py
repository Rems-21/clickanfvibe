from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    name = Column(String(255), default="Utilisateur")
    profile_picture = Column(Text, nullable=True)
    country = Column(String(255), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    credits = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    musics = relationship("Music", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # If null, broadcast to all
    title = Column(String(255))
    message = Column(Text)
    type = Column(String(50), default="info") # info, success, warning, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Music(Base):
    __tablename__ = "musics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    prompt = Column(String(255))
    style = Column(String(255))
    mood = Column(String(255))
    duration_str = Column(String(255))
    audio_url = Column(String(255))
    cover_url = Column(String(255), nullable=True)
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
    payment_method = Column(String(255))
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
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(255), default="Brouillon") # Brouillon, Active, Terminée
    is_active = Column(Boolean, default=False)
    
    promo_type = Column(String(255)) # FREE_GENS, BONUS_RECHARGE, DISCOUNT, PROMO_CODE
    
    # Specific fields based on type
    free_gens = Column(Integer, default=0)
    bonus_gens = Column(Integer, default=0)
    min_recharge = Column(Integer, default=0)
    discount_percent = Column(Integer, default=0)
    discount_amount = Column(Integer, default=0)
    promo_code = Column(String(255), unique=True, index=True, nullable=True)
    
    # Targeting and usage
    target_audience = Column(String(255), default="ALL") # ALL, NEW, PREMIUM, INACTIVE, VIP, SPECIFIC_COUNTRY, SPECIFIC_USERS
    target_country = Column(String(255), nullable=True)
    auto_event = Column(String(255), default="NONE") # NONE, SIGNUP, BIRTHDAY, REFERRAL, FIRST_RECHARGE, HOLIDAY
    
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

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(255), primary_key=True, index=True)
    value = Column(String(255))
    description = Column(String(255), nullable=True)
