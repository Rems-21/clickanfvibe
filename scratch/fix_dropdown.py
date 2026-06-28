with open('src/pages/Credits.css', 'r', encoding='utf-8') as f:
    content = f.read()

bad_css = """.phone-input-wrapper-with-code {
    display: flex;
    align-items: stretch;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s;
    overflow: hidden;
}"""

good_css = """.phone-input-wrapper-with-code {
    display: flex;
    align-items: stretch;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s;
    /* overflow: hidden; Removed to allow dropdown to be visible */
}"""

content = content.replace(bad_css, good_css)

with open('src/pages/Credits.css', 'w', encoding='utf-8') as f:
    f.write(content)

# Also fix the availableCountries dependency issue in Credits.jsx to prevent any performance hit
with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    jsx_content = f.read()

bad_deps = "}, [paymentNetwork, availableCountries, isoCode]);"
good_deps = "}, [paymentNetwork]); // We only care when the network changes"

jsx_content = jsx_content.replace(bad_deps, good_deps)

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx_content)

print("Fixed overflow hidden and useEffect deps")
