import sqlite3
from typing import Dict

def init_db(db_path: str):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS new_tt (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            summary TEXT,
            content TEXT,
            description TEXT,
            published TEXT,
            link TEXT,
            translated_title TEXT,
            translated_summary TEXT,
            translated_content TEXT,
            translated_description TEXT,
            risk_country TEXT,
            risk_type TEXT,
            risk_level TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_to_db(db_path: str, data: Dict):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # 自动将所有字段转为字符串，None转为空字符串
    values = [str(data.get(key, '') if data.get(key, '') is not None else '') for key in [
        'title', 'summary', 'content', 'description', 'published', 'link',
        'translated_title', 'translated_summary', 'translated_content', 'translated_description',
        'risk_country', 'risk_type', 'risk_level', 'created_at']]
    c.execute('''
        INSERT INTO new_tt (title, summary, content, description, published, link, translated_title, translated_summary, translated_content, translated_description, risk_country, risk_type, risk_level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)
    ''', values)
    conn.commit()
    conn.close() 