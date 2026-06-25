import sqlite3
from collections import defaultdict

conn = sqlite3.connect('click_and_vibe.db')
cursor = conn.cursor()
rows = cursor.execute('SELECT id, owner_id, prompt FROM musics').fetchall()

groups = defaultdict(list)
for r in rows:
    groups[(r[1], r[2])].append(r[0])

to_delete = []
for ids in groups.values():
    if len(ids) > 2:
        to_delete.extend(ids[2:])

if to_delete:
    placeholders = ','.join('?' * len(to_delete))
    cursor.execute(f'DELETE FROM musics WHERE id IN ({placeholders})', to_delete)
    conn.commit()

print(f"Deleted {len(to_delete)} rows based on prompt.")
