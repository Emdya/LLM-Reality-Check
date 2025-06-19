import sqlite3

conn = sqlite3.connect("interactions.db", check_same_thread = False)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT,
        response TEXT,
        timestamp TEXT,
        similarity_score REAL
    )
''')

conn.commit()

def log_interaction(submission, score):
    cursor.execute('''
        INSERT INTO interactions (prompt, response, timestamp, similarity_score)
        VALUES (?, ?, ?, ?)
    ''', (submission.prompt, submission.response, submission.timestamp, score))
    conn.commit()