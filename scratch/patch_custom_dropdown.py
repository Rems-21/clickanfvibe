import re

with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ChevronDown to imports
import_str = "import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2, X, Smartphone, CheckCircle } from 'lucide-react';"
new_import_str = "import { Zap, HelpCircle, Music, Sparkles, Clock, ArrowRight, ShieldCheck, Gift, Loader2, X, Smartphone, CheckCircle, ChevronDown } from 'lucide-react';"
content = content.replace(import_str, new_import_str)

# 2. Add showCountryDropdown state
state_vars = """  const [countryCode, setCountryCode] = useState('+225');
  const [isoCode, setIsoCode] = useState('CI');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');
  const [paymentStatus, setPaymentStatus] = useState('idle');"""
new_state_vars = """  const [countryCode, setCountryCode] = useState('+225');
  const [isoCode, setIsoCode] = useState('CI');
  const [paymentNetwork, setPaymentNetwork] = useState('wave');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);"""
content = content.replace(state_vars, new_state_vars)

# 3. Add countriesByNetwork and useEffect
hook_location = """  useEffect(() => {
    const fetchPromos = async () => {"""

countries_code = """  const countriesByNetwork = {
    mtn_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'CM', code: '+237', name: 'Cameroun', flag: '🇨🇲' },
      { iso: 'BJ', code: '+229', name: 'Bénin', flag: '🇧🇯' },
      { iso: 'GN', code: '+224', name: 'Guinée', flag: '🇬🇳' }
    ],
    orange_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'SN', code: '+221', name: 'Sénégal', flag: '🇸🇳' },
      { iso: 'ML', code: '+223', name: 'Mali', flag: '🇲🇱' },
      { iso: 'BF', code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
      { iso: 'GN', code: '+224', name: 'Guinée', flag: '🇬🇳' },
      { iso: 'CM', code: '+237', name: 'Cameroun', flag: '🇨🇲' },
      { iso: 'CD', code: '+243', name: 'RDC', flag: '🇨🇩' }
    ],
    wave: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'SN', code: '+221', name: 'Sénégal', flag: '🇸🇳' },
      { iso: 'ML', code: '+223', name: 'Mali', flag: '🇲🇱' }
    ],
    moov_money: [
      { iso: 'CI', code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { iso: 'TG', code: '+228', name: 'Togo', flag: '🇹🇬' },
      { iso: 'BJ', code: '+229', name: 'Bénin', flag: '🇧🇯' },
      { iso: 'BF', code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
      { iso: 'NE', code: '+227', name: 'Niger', flag: '🇳🇪' }
    ]
  };

  const availableCountries = countriesByNetwork[paymentNetwork] || countriesByNetwork['wave'];
  const currentCountry = availableCountries.find(c => c.iso === isoCode) || availableCountries[0];

  useEffect(() => {
    const isValid = availableCountries.find(c => c.iso === isoCode);
    if (!isValid) {
      setIsoCode(availableCountries[0].iso);
      setCountryCode(availableCountries[0].code);
    }
  }, [paymentNetwork, availableCountries, isoCode]);

"""
content = content.replace(hook_location, countries_code + hook_location)

# 4. Replace the old select with custom dropdown
old_select = """                            <div className="country-code-selector">
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
                            </div>"""

new_select = """                            <div className="country-code-selector custom-dropdown-container">
                                <button 
                                    type="button"
                                    className="custom-dropdown-btn" 
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                >
                                    <span className="flag-icon">{currentCountry.flag}</span>
                                    <span>{currentCountry.code}</span>
                                    <ChevronDown size={14} />
                                </button>
                                
                                {showCountryDropdown && (
                                    <div className="custom-dropdown-menu">
                                        {availableCountries.map(country => (
                                            <div 
                                                key={country.iso} 
                                                className={`custom-dropdown-item ${isoCode === country.iso ? 'active' : ''}`}
                                                onClick={() => {
                                                    setIsoCode(country.iso);
                                                    setCountryCode(country.code);
                                                    setShowCountryDropdown(false);
                                                }}
                                            >
                                                <span className="flag-icon">{country.flag}</span>
                                                <span className="country-name">{country.name}</span>
                                                <span className="country-code-span">{country.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>"""

content = content.replace(old_select, new_select)

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Append CSS for custom dropdown
css = """
/* Custom Dropdown for Country Code */
.custom-dropdown-container {
    position: relative;
    display: flex;
    align-items: center;
}

.custom-dropdown-btn {
    background: transparent;
    border: none;
    color: white;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 1rem;
    outline: none;
}

.custom-dropdown-btn .flag-icon {
    font-size: 1.2rem;
    line-height: 1;
}

.custom-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: max-content;
    min-width: 200px;
    background: #1e1b4b;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    z-index: 100;
    overflow: hidden;
    margin-top: 5px;
}

.custom-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.custom-dropdown-item:hover {
    background: rgba(139, 92, 246, 0.2);
}

.custom-dropdown-item.active {
    background: rgba(139, 92, 246, 0.4);
}

.custom-dropdown-item .flag-icon {
    font-size: 1.2rem;
}

.custom-dropdown-item .country-name {
    flex: 1;
    font-size: 0.9rem;
    color: #cbd5e1;
}

.custom-dropdown-item .country-code-span {
    font-size: 0.85rem;
    color: #94a3b8;
    font-weight: bold;
}
"""

with open('src/pages/Credits.css', 'a', encoding='utf-8') as f:
    f.write(css)

print("Patch custom dropdown applied!")
