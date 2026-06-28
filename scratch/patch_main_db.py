import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import text
if "from sqlalchemy import text" not in content:
    content = content.replace("from sqlalchemy.orm import Session", "from sqlalchemy.orm import Session\nfrom sqlalchemy import text")

# 2. Add the upgrade-db endpoint
upgrade_route = """
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
            results.append(f"FAILED (already exists or error): {q}")
            
    try:
        models.Base.metadata.create_all(bind=engine)
        results.append("SUCCESS: created missing tables")
    except Exception as e:
        results.append(f"FAILED creating tables: {str(e)}")
        
    return {"status": "Upgrade finished", "details": results}
"""
if "/api/admin/upgrade-db" not in content:
    # Insert right before @app.post("/api/auth/signup")
    content = content.replace('@app.post("/api/auth/signup")', upgrade_route + '\n@app.post("/api/auth/signup")')

# 3. Wrap setting query in signup
old_setting = """    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    default_credits = int(setting.value) if setting and setting.value.isdigit() else 0"""

new_setting = """    try:
        setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
        default_credits = int(setting.value) if setting and setting.value.isdigit() else 0
    except Exception as e:
        print("Settings table query failed:", e)
        db.rollback()
        default_credits = 0"""

content = content.replace(old_setting, new_setting)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("main.py patched successfully.")
