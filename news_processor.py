import feedparser
from datetime import datetime
from db_utils import save_to_db
from config import RSS_FEEDS, DB_PATH, DB_TABLE
from translator import DoubaoTranslator

def process_news(entry, translator: DoubaoTranslator):
    title = entry.title
    summary = entry.summary if 'summary' in entry else ''
    content = entry.content if 'content' in entry else ''
    description = entry.description if 'description' in entry else ''
    published = entry.published if 'published' in entry else ''
    link = entry.link

    translated_title = translator.translate(title)
    translated_summary = translator.translate(summary)
    translated_content = translator.translate(content)
    translated_description = translator.translate(description)
    risk_country = translator.classify_risk_country(translated_summary)
    risk_type = translator.classify(translated_summary)
    risk_level = translator.classify_risk_level(translated_summary)

    save_to_db(DB_PATH, {
        'title': title,
        'summary': summary,
        'content': content,
        'description': description,
        'published': published,
        'link': link,
        'translated_title': translated_title,
        'translated_summary': translated_summary,
        'translated_content': translated_content,
        'translated_description': translated_description,
        'risk_country': risk_country,
        'risk_type': risk_type,
        'risk_level': risk_level,
        'created_at': datetime.now().isoformat()
    })
    print(f"已保存新闻: {title}")

def monitor_rss(translator: DoubaoTranslator):
    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries:
            process_news(entry, translator) 