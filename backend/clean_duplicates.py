import os
import hashlib
import sqlite3

DB_PATH = 'click_and_vibe.db'
OUTPUT_DIR = '../public/generations'

def get_file_hash(filepath):
    if not os.path.exists(filepath):
        return None
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def clean_duplicates():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all musics ordered by created_at DESC to keep the newest or oldest?
    # Let's order by id ASC to keep the oldest (original)
    cursor.execute("SELECT id, audio_url, cover_url, owner_id FROM musics ORDER BY id ASC")
    musics = cursor.fetchall()
    
    seen_hashes = set()
    to_delete_ids = []
    
    for m in musics:
        m_id, audio_url, cover_url, owner_id = m
        if not audio_url:
            continue
            
        # extract filename from /generations/...
        filename = audio_url.split('/')[-1]
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        file_hash = get_file_hash(filepath)
        if file_hash:
            # unique key: user_id + file_hash
            unique_key = f"{owner_id}_{file_hash}"
            if unique_key in seen_hashes:
                # Duplicate found!
                to_delete_ids.append((m_id, filepath, cover_url))
            else:
                seen_hashes.add(unique_key)
        else:
            # File missing, maybe delete from db? Let's just ignore for now to be safe
            pass
            
    print(f"Found {len(to_delete_ids)} duplicates.")
    
    for m_id, audio_filepath, cover_url in to_delete_ids:
        print(f"Deleting duplicate music ID: {m_id}")
        cursor.execute("DELETE FROM musics WHERE id = ?", (m_id,))
        
        # also delete favorite associations if any
        cursor.execute("DELETE FROM favorites WHERE music_id = ?", (m_id,))
        
        # Optionally delete the file on disk to save space
        if os.path.exists(audio_filepath):
            try:
                os.remove(audio_filepath)
            except Exception as e:
                print(f"Could not delete {audio_filepath}: {e}")
                
        if cover_url:
            cover_filename = cover_url.split('/')[-1]
            cover_filepath = os.path.join(OUTPUT_DIR, cover_filename)
            if os.path.exists(cover_filepath):
                try:
                    os.remove(cover_filepath)
                except Exception:
                    pass

    conn.commit()
    conn.close()
    print("Done!")

if __name__ == '__main__':
    clean_duplicates()
