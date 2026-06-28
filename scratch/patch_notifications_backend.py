import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = """
# --- NOTIFICATIONS ---

from pydantic import BaseModel

class NotificationCreate(BaseModel):
    user_id: int = None
    title: str
    message: str
    type: str = "info"

@app.get("/api/notifications")
def get_user_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Get user specific and broadcast (user_id is None) notifications
    notifs = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) | (models.Notification.user_id == None)
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    return notifs

@app.post("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif and (notif.user_id == current_user.id or notif.user_id == None):
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@app.post("/api/admin/notifications")
def create_notification(req: NotificationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    new_notif = models.Notification(
        user_id=req.user_id,
        title=req.title,
        message=req.message,
        type=req.type
    )
    db.add(new_notif)
    db.commit()
    logger.info(f"Admin {current_user.email} a envoyé une notification '{req.title}'")
    return {"status": "success", "id": new_notif.id}
"""

if "def get_user_notifications" not in content:
    content = content + endpoints

# Add payment notification
old_kpay = """        print("Paiement validé par Webhook KPay:", transaction_id)
        logger.info(f"Paiement validé pour l'utilisateur ID {user_id}. Crédits ajoutés: {credits_to_add}")
        
        return {"status": "success"}"""

new_kpay = """        print("Paiement validé par Webhook KPay:", transaction_id)
        logger.info(f"Paiement validé pour l'utilisateur ID {user_id}. Crédits ajoutés: {credits_to_add}")
        
        notif = models.Notification(
            user_id=user_id,
            title="Paiement réussi",
            message=f"Votre compte a été crédité de {credits_to_add} crédits.",
            type="success"
        )
        db.add(notif)
        db.commit()
        
        return {"status": "success"}"""

content = content.replace(old_kpay, new_kpay)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Backend notifications patched.")
