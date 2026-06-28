import re

with open('backend/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove any Setting class definitions
content = re.sub(r'class Setting\(Base\):.*?description = Column\(String\(255\), nullable=True\)\n', '', content, flags=re.DOTALL)

# 2. Fix the duplicate created_by in Transaction if it exists
content = re.sub(r'    user = relationship\("User", back_populates="transactions"\)\s+created_by = Column\(Integer, ForeignKey\("users\.id"\), nullable=True\)', '    user = relationship("User", back_populates="transactions")', content)

# 3. Ensure the file ends cleanly
content = content.strip() + '\n\n'

# 4. Append Setting class at the very end
setting_class = """class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(255), primary_key=True, index=True)
    value = Column(String(255))
    description = Column(String(255), nullable=True)
"""
content += setting_class

with open('backend/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("models.py cleaned and Setting appended correctly.")
