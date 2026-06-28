import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix admin delete music
old_delete = """@app.delete("/api/admin/musics/{music_id}")
def admin_delete_music(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        raise HTTPException(status_code=404, detail="Music not found")
    
    db.query(models.Favorite).filter(models.Favorite.music_id == music_id).delete()
    
    db.delete(music)
    db.commit()
    return {"status": "success", "message": "Music deleted by admin"}"""

new_delete = """@app.delete("/api/admin/musics/{music_id}")
def admin_delete_music(music_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    logger.info(f"L'admin {current_user.email} tente de supprimer la musique {music_id}")
    music = db.query(models.Music).filter(models.Music.id == music_id).first()
    if not music:
        logger.warning(f"Suppression échouée: Musique {music_id} introuvable.")
        raise HTTPException(status_code=404, detail="Music not found")
    
    try:
        db.query(models.Favorite).filter(models.Favorite.music_id == music_id).delete(synchronize_session=False)
        db.delete(music)
        db.commit()
        logger.info(f"Musique {music_id} supprimée avec succès par {current_user.email}.")
        return {"status": "success", "message": "Music deleted by admin"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors de la suppression de la musique {music_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur serveur lors de la suppression")"""

content = content.replace(old_delete, new_delete)

# Add logs to signup
old_signup = """        user = models.User(email=req.email, hashed_password=hashed_pw, name=req.name, credits=free_credits, verification_code=verification_code)
        db.add(user)
        db.commit()
        db.refresh(user)"""
new_signup = """        user = models.User(email=req.email, hashed_password=hashed_pw, name=req.name, credits=free_credits, verification_code=verification_code)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Nouvel utilisateur inscrit: {user.email}")"""
content = content.replace(old_signup, new_signup)

# Add logs to login
old_login = """    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}"""
new_login = """    access_token = auth.create_access_token(data={"sub": user.email})
    logger.info(f"Connexion réussie: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}"""
content = content.replace(old_login, new_login)

# Add logs to generation
old_gen = """    except Exception as e:
        print("Erreur Suno API:", e)
        raise HTTPException(status_code=500, detail="Erreur lors de la communication avec l'IA")"""
new_gen = """    except Exception as e:
        logger.error(f"Erreur de génération pour {current_user.email} (prompt: {req.prompt}): {e}")
        print("Erreur Suno API:", e)
        raise HTTPException(status_code=500, detail="Erreur lors de la communication avec l'IA")"""
content = content.replace(old_gen, new_gen)

old_gen_success = """    current_user.credits -= credits_to_deduct
    
    musics = []"""
new_gen_success = """    current_user.credits -= credits_to_deduct
    logger.info(f"Génération lancée par {current_user.email}. Crédits restants: {current_user.credits}")
    
    musics = []"""
content = content.replace(old_gen_success, new_gen_success)

# Add logs to payment initiate
old_pay_initiate = """    data = {
        "amount": req.amount_fcfa,
        "currency": "XOF","""
new_pay_initiate = """    logger.info(f"Paiement KPay initié par {current_user.email} pour {req.amount_fcfa} FCFA")
    data = {
        "amount": req.amount_fcfa,
        "currency": "XOF","""
content = content.replace(old_pay_initiate, new_pay_initiate)

# Add logs to payment webhook
old_kpay = """    print("WEBHOOK KPAY RECU:", payload)

    # 1) Extraire les informations"""
new_kpay = """    print("WEBHOOK KPAY RECU:", payload)
    logger.info(f"Webhook KPay reçu. Payload: {payload}")

    # 1) Extraire les informations"""
content = content.replace(old_kpay, new_kpay)

old_kpay_success = """        print("Paiement validé par Webhook KPay:", transaction_id)
        
        return {"status": "success"}"""
new_kpay_success = """        print("Paiement validé par Webhook KPay:", transaction_id)
        logger.info(f"Paiement validé pour l'utilisateur ID {user_id}. Crédits ajoutés: {credits_to_add}")
        
        return {"status": "success"}"""
content = content.replace(old_kpay_success, new_kpay_success)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch appliqué avec succès.")
