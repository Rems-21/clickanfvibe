import re

# 1. Patch Signup.jsx
with open('src/pages/Signup.jsx', 'r', encoding='utf-8') as f:
    signup_content = f.read()

old_signup = """    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);"""

new_signup = """    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      // Track Registration
      if (window.fbq) {
        window.fbq('track', 'CompleteRegistration', { content_name: 'Signup' });
      }
    }
    setLoading(false);"""

signup_content = signup_content.replace(old_signup, new_signup)
with open('src/pages/Signup.jsx', 'w', encoding='utf-8') as f:
    f.write(signup_content)

# 2. Patch Create.jsx
with open('src/pages/Create.jsx', 'r', encoding='utf-8') as f:
    create_content = f.read()

old_create = """          <button className="btn-primary-gradient full-width large" onClick={() => {
            if (!user || user.credits < 1) {
              navigate('/credits');
              return;
            }
            navigate('/generating', {"""

new_create = """          <button className="btn-primary-gradient full-width large" onClick={() => {
            if (!user || user.credits < 1) {
              navigate('/credits');
              return;
            }
            // Track Music Generation Initiation
            if (window.fbq) {
              window.fbq('trackCustom', 'GenerateMusic', { style, mood });
            }
            navigate('/generating', {"""

create_content = create_content.replace(old_create, new_create)
with open('src/pages/Create.jsx', 'w', encoding='utf-8') as f:
    f.write(create_content)

# 3. Patch PaymentSuccess.jsx
with open('src/pages/PaymentSuccess.jsx', 'r', encoding='utf-8') as f:
    payment_content = f.read()

old_payment = """      try {
        await refreshCredits();
      } catch (err) {"""

new_payment = """      try {
        await refreshCredits();
        // Track Purchase
        if (window.fbq) {
          window.fbq('track', 'Purchase', { currency: 'EUR', value: 0 }); // You can adjust value if known
        }
      } catch (err) {"""

payment_content = payment_content.replace(old_payment, new_payment)
with open('src/pages/PaymentSuccess.jsx', 'w', encoding='utf-8') as f:
    f.write(payment_content)

print("All files patched successfully.")
