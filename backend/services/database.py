import sqlite3
from datetime import datetime

conn = sqlite3.connect("interactions.db", check_same_thread = False)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT,
        response TEXT,
        timestamp TEXT,
        similarity_score REAL,
        summary TEXT
    )
''')

conn.commit()

def log_interaction(prompt, response, score, summary):
    timestamp = datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO interactions (prompt, response, timestamp, similarity_score, summary)
        VALUES (?, ?, ?, ?, ?)
    ''', (prompt, response, timestamp, score, summary))
    conn.commit()