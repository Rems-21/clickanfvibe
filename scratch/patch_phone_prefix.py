# Patch frontend
with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_vars = """  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');"""
new_state_vars = """  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+225');
  const [isoCode, setIsoCode] = useState('CI');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');"""

content = content.replace(state_vars, new_state_vars)

old_body = """              payment_method: paymentNetwork,
              phone_number: phoneNumber,
              origin: window.location.origin"""
new_body = """              payment_method: paymentNetwork,
              phone_number: `${countryCode}${phoneNumber.replace(/^0+/, '')}`,
              country: isoCode,
              origin: window.location.origin"""

content = content.replace(old_body, new_body)

old_phone_input = """                    <div className="phone-input-group">
                        <label>Numéro de téléphone Mobile Money</label>
                        <div className="phone-input-wrapper">
                            <Smartphone size={20} className="phone-icon" />
                            <input 
                                type="tel" 
                                placeholder="Ex: 0701020304" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="phone-input"
                            />
                        </div>
                    </div>"""

new_phone_input = """                    <div className="phone-input-group">
                        <label>Numéro de téléphone Mobile Money</label>
                        <div className="phone-input-wrapper-with-code">
                            <div className="country-code-selector">
                                <select 
                                    value={`${isoCode}|${countryCode}`} 
                                    onChange={(e) => {
                                        const [iso, code] = e.target.value.split('|');
                                        setIsoCode(iso);
                                        setCountryCode(code);
                                    }}
                                >
                                    <option value="CI|+225">🇨🇮 +225</option>
                                    <option value="SN|+221">🇸🇳 +221</option>
                                    <option value="ML|+223">🇲🇱 +223</option>
                                    <option value="BF|+226">🇧🇫 +226</option>
                                    <option value="CM|+237">🇨🇲 +237</option>
                                    <option value="CD|+243">🇨🇩 +243</option>
                                </select>
                            </div>
                            <input 
                                type="tel" 
                                placeholder="Ex: 0701020304" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="phone-input phone-input-with-code"
                            />
                        </div>
                    </div>"""

content = content.replace(old_phone_input, new_phone_input)

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Patch backend
with open('backend/main.py', 'r', encoding='utf-8') as f:
    backend_content = f.read()

old_req = """class PaymentInitiateRequest(BaseModel):
    amount_fcfa: int
    credits_to_add: int
    payment_method: str = None
    origin: str = None
    phone_number: str = None"""
new_req = """class PaymentInitiateRequest(BaseModel):
    amount_fcfa: int
    credits_to_add: int
    payment_method: str = None
    origin: str = None
    phone_number: str = None
    country: str = "CI\""""

backend_content = backend_content.replace(old_req, new_req)

old_payload = """    if req.phone_number:
        payload["customer"]["phone"] = req.phone_number"""

new_payload = """    if req.phone_number:
        payload["customer"]["phone"] = req.phone_number
    if req.country:
        payload["customer"]["country"] = req.country"""

backend_content = backend_content.replace(old_payload, new_payload)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(backend_content)

# Append CSS
css_to_append = """
.phone-input-wrapper-with-code {
    display: flex;
    align-items: stretch;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s;
    overflow: hidden;
}

.phone-input-wrapper-with-code:focus-within {
    border-color: #8b5cf6;
}

.country-code-selector {
    background: rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
}

.country-code-selector select {
    background: transparent;
    color: white;
    border: none;
    padding: 12px;
    font-size: 1rem;
    outline: none;
    cursor: pointer;
    appearance: none; /* remove default arrow */
    -webkit-appearance: none;
}

.country-code-selector select option {
    background: #1e1b4b;
    color: white;
}

.phone-input-with-code {
    border: none;
    background: transparent;
    padding: 12px;
    border-radius: 0;
}

.phone-input-with-code:focus {
    border-color: transparent;
}
"""

with open('src/pages/Credits.css', 'a', encoding='utf-8') as f:
    f.write(css_to_append)

print("Patch applied for country codes")
