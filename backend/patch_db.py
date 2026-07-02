import sqlalchemy
from database import engine

def apply_patch():
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("ALTER TABLE musics MODIFY prompt TEXT;"))
            conn.commit()
        print("Successfully updated prompt column to TEXT")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    apply_patch()
