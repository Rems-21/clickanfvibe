import sys
import os
import random
import datetime

# Add the parent directory to sys.path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import User, Music, Transaction, AnalyticsEvent

def seed_data():
    db = SessionLocal()
    
    # 1. Create a few users
    users = []
    for i in range(1, 15):
        user = User(
            email=f"user{i}@example.com",
            name=f"Utilisateur {i}",
            credits=random.randint(0, 50),
            is_premium=random.choice([True, False]),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 30))
        )
        db.add(user)
        users.append(user)
    db.commit()

    # Get users with IDs to use for relationships
    db_users = db.query(User).all()
    user_ids = [u.id for u in db_users]

    # 2. Create some generations (musics)
    styles = ["Afrobeat", "Amapiano", "Couper Décaler", "Drill", "Trap"]
    moods = ["Joyeux", "Énergique", "Triste", "Romantique", "Détendu"]
    
    for i in range(50):
        m = Music(
            title=f"Ma Musique {i}",
            prompt=f"Un super son de type {random.choice(styles)}",
            style=random.choice(styles),
            mood=random.choice(moods),
            duration_str="2:30",
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            cover_url=f"https://picsum.photos/seed/{random.randint(1,1000)}/400/400",
            owner_id=random.choice(user_ids),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 100)),
            play_count=random.randint(1, 500),
            is_trending=random.choice([True, False, False, False]),
            is_explore=random.choice([True, False])
        )
        db.add(m)
    
    # 3. Create transactions
    methods = ["Mobile Money", "Orange Money", "Wave", "Carte Bancaire"]
    for i in range(30):
        t = Transaction(
            user_id=random.choice(user_ids),
            amount_credits=random.choice([2, 5, 10, 25, 50]),
            price_fcfa=random.choice([2300, 5000, 9000, 20000, 35000]),
            payment_method=random.choice(methods),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 30))
        )
        db.add(t)

    # 4. Create analytics events to populate the funnel
    events = ["visit", "visit", "visit", "visit", "signup", "login", "create_click", "generate", "payment_init", "payment_success"]
    sources = ["whatsapp", "facebook", "instagram", "tiktok", "direct", "google"]
    
    for i in range(150):
        evt = random.choice(events)
        a = AnalyticsEvent(
            event_type=evt,
            user_id=random.choice(user_ids) if evt != "visit" else None,
            source=random.choice(sources) if evt == "visit" else None,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 7))
        )
        db.add(a)

    db.commit()
    db.close()
    print("Données factices injectées avec succès !")

if __name__ == "__main__":
    seed_data()
