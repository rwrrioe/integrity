import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Берем ключ из .env или хардкодим (для тестов, но лучше в .env)
API_KEY = os.getenv('GEMINI_API_KEY') 
genai.configure(api_key=API_KEY)

class LLMEngine:
    def __init__(self):
        # Используем быструю модель, как в твоем примере
        self.model = genai.GenerativeModel('gemini-2.5-flash-lite')

    def analyze_pipeline_executive(self, pipeline_name, stats_text):
        API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyB1pmYSfNLZC9u8zygX2_aN3NABj7mvhy4')
        genai.configure(api_key=API_KEY)

        """
        Генерирует Executive Summary для всего трубопровода.
        Возвращает JSON строку.
        """
        prompt = f"""
        You are a Senior Pipeline Integrity Engineer. Analyze the summary data for pipeline '{pipeline_name}'.
        
        Data Summary:
        {stats_text}
        
        Task:
        1. Identify 3-4 Key Findings based on the stats.
        2. Provide 3 Strategic Recommendations (categorized by priority).
        
        OUTPUT FORMAT (Strict JSON):
        {{
            "findings": ["finding 1", "finding 2", ...],
            "recommendations": [
                {{"priority": "High Priority", "title": "Title here", "description": "Actionable advice..."}},
                {{"priority": "Medium Priority", "title": "Title here", "description": "Actionable advice..."}}
            ]
        }}
        Do not use Markdown formatting like ```json ... ```. Just raw JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Очистка от возможных маркдаунов, если модель их добавит
            text = response.text.replace('```json', '').replace('```', '').strip()
            return text
        except Exception as e:
            print(f"Gemini Exec Error: {e}")
            # Возврат заглушки, чтобы сервис не упал
            return json.dumps({
                "findings": ["Automated analysis temporarily unavailable."],
                "recommendations": []
            })

    def analyze_single_defect_risk(self, data):
        API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyB1pmYSfNLZC9u8zygX2_aN3NABj7mvhy4')
        genai.configure(api_key=API_KEY)

        """
        Твоя функция для анализа конкретного дефекта.
        """
        prompt = f"""
        Проанализируй данные о состоянии трубопровода и риске аварии. Создай детальный отчёт.

        ДАННЫЕ ТРУБОПРОВОДА:
        - Глубина залегания: {data.get('depth', 'N/A')} м
        - Длина участка: {data.get('length', 1000)} м
        - Тип дефекта: {data.get('defect_type', 'Unknown')}
        - Рабочее давление: {data.get('pressure', 0)} бар
        - Диаметр трубы: {data.get('diameter', 0)} мм
        - Возраст трубопровода: {data.get('age', 0)} лет
        - Вибрация (RMS): {data.get('rms_vibration', 0)}
        - Вибрация (Peak): {data.get('peak_vibration', 0)}
        - Показатель аномалии: {data.get('anomaly_score', 0)}
        - РАСЧЁТНЫЙ РИСК АВАРИИ: {data.get('risk', 0)} (шкала 0-1)

        ЗАДАЧА:
        Создай подробный технический отчёт (Plain Text, без Markdown заголовков #), который включает:
        1. Оценку текущего состояния.
        2. Анализ критических параметров.
        3. Рекомендации по ремонту.
        
        Пиши кратко, по делу, как для инженерного отчета. Объем ~150 слов.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Ошибка генерации отчета Gemini: {str(e)}"