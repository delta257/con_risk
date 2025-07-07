import time
from config import API_KEY, DB_PATH, DB_TABLE
from db_utils import init_db
from translator import DoubaoTranslator
from news_processor import monitor_rss

if __name__ == '__main__':
    init_db(DB_PATH)
    translator = DoubaoTranslator(API_KEY)
    while True:
        monitor_rss(translator)
        print("—— 正在等待下一轮监测 ——")
        time.sleep(1800)