import datetime
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models

def restore_music():
    db = SessionLocal()
    try:
        new_music = models.Music(
            title='Frida MBANI Reviens',
            prompt="Je veux demander pardon à Frida MBANI la fille que j'aime car je me suis mal comporté mon égo et mon orgueil tue notre amour nous avons passé des moments merveilleux ensemble je te réserve un meilleur avenir je veux faire de toi ma femme pardonne moi je vais faire des efforts pour être un meilleur homme à tes yeux",
            style='Afrobeat',
            mood='Romantique',
            duration_str='2:30',
            audio_url='/generations/4146ea9e913bbf775fc99812a7653576.mp3',
            cover_url='/generations/71d3577b5a628eb04ab4d0fa49ea4c31.jpeg',
            created_at=datetime.datetime(2026, 7, 2, 20, 46, 41),
            play_count=0,
            is_trending=False,
            is_explore=False,
            lyrics="[Verse 1]\nFrida MBANI, j’ai fauté\nJ’ai laissé mon cœur se fermer\nMon égo m’a trop parlé\nMon orgueil a tout blessé\n\nJe revois nos beaux instants passés\nJe veux te garder toujours\n\nPardonne-moi, Frida MBANI\nJe laisse tomber la fierté\nPardonne-moi, Frida MBANI\nJe veux t’aimer mieux, te respecter",
            owner_id=309
        )
        db.add(new_music)
        db.commit()
        print("Music restored successfully.")
    except Exception as e:
        db.rollback()
        print("Error restoring music:", e)
    finally:
        db.close()

if __name__ == "__main__":
    restore_music()
