with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_req = """class PaymentInitiateRequest(BaseModel):
    amount_fcfa: int
    credits_to_add: int
    payment_method: str = None
    origin: str = None"""

new_req = """class PaymentInitiateRequest(BaseModel):
    amount_fcfa: int
    credits_to_add: int
    payment_method: str = None
    origin: str = None
    phone_number: str = None"""

content = content.replace(old_req, new_req)


old_payload = """    payload = {
        "amount": req.amount_fcfa,
        "description": f"Recharge de {req.credits_to_add} Gens - Click & Vibe",
        "customer": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "success_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-success",
        "error_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-failed",
        "metadata": {
            "user_id": current_user.id,
            "credits_to_add": req.credits_to_add,
            "amount_fcfa": req.amount_fcfa,
            "payment_method": req.payment_method
        },
        "gateway": "mtn_momo"
    }
    
    if req.payment_method:
        payload["payment_method"] = req.payment_method"""

new_payload = """    payload = {
        "amount": req.amount_fcfa,
        "description": f"Recharge de {req.credits_to_add} Gens - Click & Vibe",
        "customer": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "success_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-success",
        "error_url": f"{req.origin or request.headers.get('origin', 'http://localhost:5173')}/payment-failed",
        "metadata": {
            "user_id": current_user.id,
            "credits_to_add": req.credits_to_add,
            "amount_fcfa": req.amount_fcfa,
            "payment_method": req.payment_method
        }
    }
    
    if req.phone_number:
        payload["customer"]["phone"] = req.phone_number
        
    if req.payment_method:
        payload["payment_method"] = req.payment_method
        # Mapping automatique du gateway selon le payment_method
        gateway_map = {
            "mtn_money": "mtn_momo",
            "wave": "wave",
            "orange_money": "orange_money",
            "moov_money": "moov_money",
            "pawapay": "pawapay"
        }
        if req.payment_method in gateway_map:
            payload["gateway"] = gateway_map[req.payment_method]"""

content = content.replace(old_payload, new_payload)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to backend/main.py")
