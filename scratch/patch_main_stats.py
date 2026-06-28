import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add active_sessions tracking
if "active_sessions =" not in content:
    content = content.replace("import datetime", "import datetime\nimport time\n\nactive_sessions = {}")

old_get_user = """    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Votre compte a été suspendu.")
    return user"""
new_get_user = """    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Votre compte a été suspendu.")
    active_sessions[user.id] = time.time()
    return user"""
content = content.replace(old_get_user, new_get_user)

# Add endpoints for stats and tracking
stats_endpoints = """
# --- STATS & TRACKING ---

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
    # Total Users
    total_users = db.query(models.User).count()
    
    # Online Users (active in the last 5 minutes)
    now = time.time()
    online_users = sum(1 for ts in active_sessions.values() if now - ts < 300)
    
    # Total Generations
    total_generations = db.query(models.Music).count()
    
    # Total Revenue (sum of amount_fcfa in transactions)
    from sqlalchemy import func
    total_revenue = db.query(func.sum(models.Transaction.price_fcfa)).scalar() or 0
    
    # App Downloads
    setting = db.query(models.Setting).filter(models.Setting.key == "APP_DOWNLOAD_COUNT").first()
    total_downloads = int(setting.value) if setting else 0
    
    return {
        "total_users": total_users,
        "online_users": online_users,
        "total_generations": total_generations,
        "total_revenue": total_revenue,
        "total_downloads": total_downloads
    }
"""

if "def get_admin_stats" not in content:
    content = content + stats_endpoints

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied for stats.")
