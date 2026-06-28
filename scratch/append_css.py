css_to_append = """
/* White-label Payment Modal */
.payment-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.payment-modal-content {
    background: #1e1b4b;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 30px;
    width: 90%;
    max-width: 450px;
    position: relative;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    color: white;
}

.payment-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.2s;
}

.payment-modal-close:hover {
    color: white;
}

.payment-modal-subtitle {
    color: #cbd5e1;
    margin-bottom: 20px;
    font-size: 0.95rem;
}

.payment-networks {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
}

.network-option {
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.network-option input[type="radio"] {
    display: none;
}

.network-details {
    padding: 15px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.05);
}

.network-option.selected .network-details {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
}

.network-name {
    font-weight: 600;
    font-size: 0.9rem;
    text-align: center;
}

.network-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 10px;
    font-weight: bold;
    text-transform: uppercase;
}

.network-badge.mtn { background: #ffcc00; color: #000; }
.network-badge.orange { background: #ff6600; color: #fff; }
.network-badge.wave { background: #1ccefd; color: #fff; }
.network-badge.moov { background: #00569c; color: #fff; }

.phone-input-group {
    margin-bottom: 20px;
}

.phone-input-group label {
    display: block;
    font-size: 0.9rem;
    color: #cbd5e1;
    margin-bottom: 8px;
}

.phone-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.phone-icon {
    position: absolute;
    left: 12px;
    color: #94a3b8;
}

.phone-input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}

.phone-input:focus {
    border-color: #8b5cf6;
}

.confirm-payment-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    border: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.confirm-payment-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
}

.payment-processing, .payment-success-modal, .payment-error-modal {
    text-align: center;
    padding: 20px 0;
}

.spin-icon {
    animation: spin 2s linear infinite;
    color: #8b5cf6;
    margin: 0 auto 20px auto;
}

.success-icon {
    color: #22c55e;
    margin: 0 auto 20px auto;
}

.error-icon {
    color: #ef4444;
    margin: 0 auto 20px auto;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.payment-instruction {
    color: #fcd34d;
    background: rgba(252, 211, 77, 0.1);
    padding: 10px;
    border-radius: 8px;
    margin-top: 15px;
    font-size: 0.95rem;
}

.payment-polling-pulse {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 25px;
    color: #94a3b8;
}

.pulse-dot {
    width: 10px;
    height: 10px;
    background-color: #8b5cf6;
    border-radius: 50%;
    animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}

.redirecting-text {
    color: #94a3b8;
    margin-top: 20px;
    font-size: 0.9rem;
}

.retry-payment-btn {
    margin-top: 20px;
    padding: 10px 20px;
    border-radius: 8px;
    background: #ef4444;
    color: white;
    border: none;
    font-weight: bold;
    cursor: pointer;
}
"""

with open('src/pages/Credits.css', 'a', encoding='utf-8') as f:
    f.write(css_to_append)
print("Appended CSS successfully.")
