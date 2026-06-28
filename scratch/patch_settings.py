with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_settings = """class SettingsUpdate(BaseModel):
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
    return {"status": "success"}"""

new_settings = """class SettingsUpdate(BaseModel):
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
    return {"status": "success"}"""

if old_settings in content:
    content = content.replace(old_settings, new_settings)
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend settings patched.")
else:
    print("Could not find the exact old settings block.")
