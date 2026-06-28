import re

with open('src/components/Layout.css', 'r', encoding='utf-8') as f:
    content = f.read()

if '.hide-on-mobile-small' not in content:
    content += """
@media (max-width: 480px) {
  .hide-on-mobile-small {
    display: none;
  }
}
"""
    with open('src/components/Layout.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Layout.css patched successfully.")
else:
    print("Layout.css already has hide-on-mobile-small.")
