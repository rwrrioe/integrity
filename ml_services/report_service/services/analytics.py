import json
import integrity_protos.gen.python.reportsv2.analytics_pb2 as pb
import integrity_protos.gen.python.reportsv2.analytics_pb2_grpc as pb_grpc

from services.map_renderer import MapRenderer
from services.llm_engine import LLMEngine

class AnalyticsService(pb_grpc.AnalyticsServiceServicer):
    def __init__(self):
        self.map_renderer = MapRenderer()
        self.llm = LLMEngine()

    # --- 1. GENERAL REPORT (Executive) ---
    def GenerateExecutiveAnalytics(self, request, context):
        print(f"Generating Executive Report for: {request.pipeline_name}")
        
        # 1. Map Generation
        defects_list = list(request.defects)
        map_bytes = self.map_renderer.generate_pipeline_map(defects_list)
        
        # 2. Stats for LLM
        stats = {
            "total": len(defects_list),
            "critical": len([d for d in defects_list if d.severity in ['Critical', 'High']]),
            "breakdown": {}
        }
        for d in defects_list:
            stats["breakdown"][d.type] = stats["breakdown"].get(d.type, 0) + 1
            
        llm_input = f"Total defects: {stats['total']}. Critical: {stats['critical']}. Breakdown: {stats['breakdown']}"
        
        # 3. LLM Call (Executive)
        llm_json_str = self.llm.analyze_pipeline_executive(request.pipeline_name, llm_input)
        
        # 4. Parsing response
        try:
            llm_data = json.loads(llm_json_str)
        except json.JSONDecodeError:
            llm_data = {"findings": ["Data processing error"], "recommendations": []}
            
        response = pb.ExecutiveResponse()
        response.key_findings.extend(llm_data.get("findings", []))
        response.map_image = map_bytes
        
        for rec in llm_data.get("recommendations", []):
            r = response.recommendations.add()
            r.priority = rec.get("priority", "Medium")
            r.title = rec.get("title", "")
            r.description = rec.get("description", "")
            
        return response

    # --- 2. SINGLE DEFECT REPORT ---
    def GenerateDefectAnalytics(self, request, context):
        print(f"Generating Defect Report: {request.defect_type} (Risk: {request.risk_level})")
        
        # 1. Map Generation (Zoom View)
        # Используем координаты прямо из request
        map_bytes = self.map_renderer.generate_single_defect_map(
            request.lat, request.lon, request.defect_type
        )
        
        # 2. Data Preparation for Gemini
        # Нам нужно превратить gRPC Request в словарь data, который ждет твой скрипт
        
        # Маппинг строкового риска в числовой (0-1) для AI
        risk_mapping = {
            "Critical": 0.95,
            "High": 0.75,
            "Medium": 0.45,
            "Low": 0.15
        }
        numeric_risk = risk_mapping.get(request.risk_level, 0.5)
        
        # Эмуляция anomaly_score (обычно коррелирует с риском)
        anomaly_score = round(numeric_risk * 0.85 + 0.1, 2)
        if anomaly_score > 1.0: anomaly_score = 0.99

        # Пиковая вибрация ≈ RMS * 1.414 (для синусоиды), либо просто чуть больше RMS
        peak_vib = round(request.vibration * 1.41, 2)

        defect_data = {
            'depth': request.depth,           # из proto
            'length': 1000,                   # Заглушка (в proto нет длины участка трубы)
            'defect_type': request.defect_type, # из proto
            'pressure': request.pressure,     # из proto
            'diameter': request.diameter,     # из proto
            'age': request.age,               # из proto
            'rms_vibration': request.vibration, # из proto
            'peak_vibration': peak_vib,       # Вычислено
            'anomaly_score': anomaly_score,   # Вычислено
            'risk': numeric_risk              # Маппинг из request.risk_level
        }
        
        # 3. LLM Call (Defect Analysis)
        # Вызываем метод, который содержит твой промпт для Gemini
        analysis_text = self.llm.analyze_single_defect_risk(defect_data)
        
        # 4. Return gRPC response
        return pb.DefectResponse(
            llm_analysis=analysis_text,
            map_image=map_bytes
        )