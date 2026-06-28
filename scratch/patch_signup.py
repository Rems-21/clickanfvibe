import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Wrap user creation in try-except
old_creation = """    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_pwd, 
        name=user.name,
        is_verified=False,
        verification_code=verification_code,
        credits=default_credits
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)"""

new_creation = """    new_user = models.User(
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
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")"""

if old_creation in content:
    content = content.replace(old_creation, new_creation)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Signup patched with error catching.")
