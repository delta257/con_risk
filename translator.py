import requests
from typing import Optional

class DoubaoTranslator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_base = "https://ark.cn-beijing.volces.com/api/v3"
        self.model_name = "deepseek-v3-250324"

    def _call_api(self, prompt: str) -> Optional[str]:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": self.model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": "你要执行风险监测预警相关的一系列任务，包括新闻内容翻译、新闻内容要点总结、新闻风险分类和新闻风险评级。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            resp = requests.post(
                f"{self.api_base}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            resp.raise_for_status()
            return resp.json()['choices'][0]['message']['content']
        except Exception as e:
            print(f"API调用失败:{e}")
            return None

    def translate(self, text: str) -> Optional[str]:
        return self._call_api(f"请将以下内容翻译成中文，保持原文语气和内容，只返回翻译结果，不要有其他多余内容\n内容：{text}")

    def summarize(self, text: str) -> Optional[str]:
        return self._call_api(f"请用中文总结出以下新闻的关键要点，注意只返回总结内容，不要有其他多余内容，100字以内：\n{text}")

    def classify(self, text: str) -> Optional[str]:
        return self._call_api(
            f"""请根据新闻内容或者关键词判断以下新闻反应了哪一类风险,如果不在这十一类里，则归类为其他：\n
            政治风险： 政变、内战、动荡、戒严、政局不稳、暴力镇压（coup, unrest, martial law, regime change, political crackdown）

            社会安全风险：抢劫、绑架、暴力犯罪、性侵、骚乱、歧视（kidnapping, robbery, protest, civil unrest, foreign hate crime, foreign assault）

            恐怖主义/极端主义：恐袭、IED爆炸、自杀袭击、IS、基地组织、塔利班、哈马斯、真主党（terror attack, bombing, suicide attack, ISIS, Al-Qaeda, Taliban, Hamas, Hezbollah）

            区域战争与武装冲突：战争、军事冲突、空袭、导弹袭击、无人机攻击、武装边境冲突、军事集结、封锁、战争升级（war, conflict, military clash, airstrike, missile attack, drone strike, mobilization, escalation）

            公共卫生风险：疫情、传染病、隔离、疫苗短缺、疫情反弹（pandemic outbreak, infection surge, quarantine）

            自然灾害风险：地震、洪水、台风、火山爆发、干旱、山火（earthquake, flood, typhoon, wildfire, drought, volcanic eruption）

            交通安全风险：交通事故、航班中断、机场关闭、铁路爆炸、港口封锁、道路封锁（flight cancellation, roadblock, railway accident, port strike, mass transportation disruption）

            边境与签证政策风险：边境封锁、签证停发、入境限制、撤侨、外国人限制（visa suspension, entry ban, evacuation, deportation, border shutdown）

            法律与执法风险：入境规定变化、外籍人员被捕、禁令、反外国法（foreign arrest, immigration law, expat restrictions, anti-foreign law）

            网络安全风险：网络攻击、黑客攻击、数据泄露、国家监控（cyberattack, hacking, spyware, surveillance, ransomware）

            突发性黑天鹅事件：枪击案、坠机、桥梁坍塌、群体踩踏、核事故、爆炸、毒气泄露（shooting, aircraft crash, explosion, radiation leak, mass casualty））\n输出只返回所属风险类型，不要有多余的内容。\n新闻内容：{text}"""
        ) 
    def classify_risk_level(self, text: str) -> Optional[str]:
        return self._call_api(
            f"""你是海外风险评估专家，专门帮中国商务差旅人士、中资在地企业、中国在地投资行为评估海外国家风险。请判断以下新闻内容对中国商务差旅人士、中资在地企业、中国在地投资行为的风险等级（红色/橙色/绿色）\n输出只返回风险等级，不要有多余的内容\n新闻内容：{text}"""
        )
    def classify_risk_country(self, text: str) -> Optional[str]:
        return self._call_api(
            f"""你是海外风险评估专家，专门帮中国商务差旅人士、中资在地企业、中国在地投资行为评估海外国家风险。请判断以下新闻内容里的事件属于哪个国家的风险\n输出只返回风险国家名字，不要有多余的内容\n新闻内容：{text}"""
        )
    def generate_weekly_report(self, news_list) -> Optional[str]:
        if not news_list:
            return "本周无新闻数据。"
        prompt = "请根据以下新闻内容，撰写一份结构清晰、重点突出的周报，内容包括本周主要风险事件、趋势分析和建议，字数控制在800字以内：\n"
        for idx, (title, summary, content, published) in enumerate(news_list, 1):
            prompt += f"\n{idx}. [{published}] {title}\n摘要：{summary}\n内容：{content[:200]}...\n"
        return self._call_api(prompt)