import os
from sqlalchemy import create_engine, inspect

DATABASE_URL = "mysql+pymysql://vibeuser:determination%40%23clickandvibe@localhost/click_and_vibe"
try:
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    print("Tables in DB:", tables)
    
    if 'promotions' in tables:
        columns = [col['name'] for col in inspector.get_columns('promotions')]
        print("Columns in promotions:", columns)
    
    if 'promotion_usages' in tables:
        print("Table promotion_usages exists.")
    else:
        print("Table promotion_usages is MISSING.")
        
except Exception as e:
    print("Error:", e)
