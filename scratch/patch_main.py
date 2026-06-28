import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update signup
signup_replacement = """    setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
    default_credits = int(setting.value) if setting and setting.value.isdigit() else 0

    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_pwd, 
        name=user.name,
        is_verified=False,
        verification_code=verification_code,
        credits=default_credits
    )"""

content = re.sub(
    r'    new_user = models\.User\(\n\s+email=user\.email, \n\s+hashed_password=hashed_pwd, \n\s+name=user\.name,\n\s+is_verified=False,\n\s+verification_code=verification_code\n\s+\)',
    signup_replacement,
    content
)

# 2. Update google_auth
google_replacement = """        setting = db.query(models.Setting).filter(models.Setting.key == "FREE_REGISTRATION_CREDITS").first()
        default_credits = int(setting.value) if setting and setting.value.isdigit() else 0
        
        user = models.User(
            email=email,
            name=name,
            hashed_password="",
            profile_picture=picture,
            credits=default_credits
        )"""

content = re.sub(
    r'        user = models\.User\(\n\s+email=email,\n\s+name=name,\n\s+hashed_password="",\n\s+profile_picture=picture\n\s+\)',
    google_replacement,
    content
)

# 3. Add Settings endpoints
if "/api/admin/settings" not in content:
    settings_endpoints = """
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
"""
    content += settings_endpoints

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("main.py patched successfully.")
