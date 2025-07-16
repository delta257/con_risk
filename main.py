import time
from config import API_KEY, DB_PATH, DB_TABLE
from db_utils import init_db
from translator import DoubaoTranslator
from news_processor import monitor_rss

# 新增: Flask AI对话API
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def call_doubao_api(messages):
    url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "doubao-seed-1.6-250615",
        "messages": messages
    }
    resp = requests.post(url, headers=headers, json=data, timeout=60)
    resp.raise_for_status()
    return resp.json()['choices'][0]['message']['content']

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.get_json()
    messages = data.get('messages', [])
    if not messages:
        return jsonify({'reply': '消息内容不能为空'}), 400
    try:
        reply = call_doubao_api(messages)
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'reply': f'AI接口请求失败: {e}'}), 500

if __name__ == '__main__':
    init_db(DB_PATH)
    translator = DoubaoTranslator(API_KEY)
    app.run(port=5000)
    # while True:
    #     monitor_rss(translator)
    #     print("—— 正在等待下一轮监测 ——")
    #     time.sleep(1800)