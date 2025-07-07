import feedparser
from langdetect import detect
import time

# 可配置的关键词词根库
KEYWORDS = {
    "政治风险": [
        "coup", "unrest", "martial law", "regime change", "political crackdown"
    ],
    "社会安全风险": [
        "kidnapping", "robbery", "protest", "civil unrest", "foreign hate crime", "foreign assault"
    ],
    "恐怖主义/极端主义": [
        "terror attack", "bombing", "suicide attack", "ISIS", "Al-Qaeda", "Taliban", "Hamas", "Hezbollah"
    ],
    "区域战争与武装冲突": [
        "war", "conflict", "military clash", "airstrike", "missile attack", "drone strike", "mobilization", "escalation"
    ],
    "公共卫生风险": [
        "pandemic outbreak", "infection surge", "quarantine"
    ],
    "自然灾害风险": [
        "earthquake", "flood", "typhoon", "wildfire", "drought", "volcanic eruption"
    ],
    "交通安全风险": [
        "flight cancellation", "roadblock", "railway accident", "port strike", "mass transportation disruption"
    ],
    "边境与签证政策风险": [
        "visa suspension", "entry ban", "evacuation", "deportation", "border shutdown"
    ],
    "法律与执法风险": [
        "foreign arrest", "immigration law", "expat restrictions", "anti-foreign law"
    ],
    "网络安全风险": [
        "cyberattack", "hacking", "spyware", "surveillance", "ransomware"
    ],
    "突发性黑天鹅事件": [
        "shooting", "aircraft crash", "explosion", "radiation leak", "mass casualty"
    ]
}

# RSS订阅源（可添加更多）
RSS_FEEDS = [
    'https://www.google.com/alerts/feeds/03057129448173602745/15207428782599511174'
    #'http://feeds.bbci.co.uk/news/world/rss.xml',
    #'https://www.aljazeera.com/xml/rss/all.xml',
    #'https://www.reutersagency.com/feed/?best-topics=conflict-crisis&post_type=best',
]

def monitor_rss():
    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        print(feed.entries)
        for entry in feed.entries:
            title = entry.title
            summary = entry.summary if 'summary' in entry else ''
            content = entry.content
            print(f"标题: {title}")
            print(f"链接: {entry.link}")
            print(f"摘要: {summary}") 
            print(f"内容: {content}")# 防止重复多次输出

if __name__ == '__main__':
    while True:
        monitor_rss()
        print("—— 正在等待下一轮监测 ——")
        time.sleep(1800)  # 每30分钟轮询一次