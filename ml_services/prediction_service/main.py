import grpc
from concurrent import futures
import torch
import torch.nn as nn
import numpy as np
import pickle
import os

import integrity_protos.gen.python.anomaly_detection.risk_service_pb2
import integrity_protos.gen.python.anomaly_detection.risk_service_pb2_grpc


class RiskNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(9, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        return self.net(x)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = RiskNet().to(device)
scaler = None

def load_artifacts():
    global model, scaler
    

    model_path = "risk_model_9features.pth"
    if not os.path.exists(model_path):
        print(f" Файл модели не найден: {model_path}")
        exit(1)
        
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        print(" Модель загружена")
    except Exception as e:
        print(f" Ошибка загрузки модели: {e}")
        exit(1)


    scaler_path = "scaler.pkl"
    if not os.path.exists(scaler_path):
        print(f" Файл скейлера не найден: {scaler_path}")
        exit(1)

    try:
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        print("Scaler загружен")
    except Exception as e:
        print(f"Ошибка загрузки скейлера: {e}")
        exit(1)


def risk_class_from_percent(rp):
    if rp < 30: return "LOW"
    elif rp < 60: return "MEDIUM"
    elif rp < 85: return "HIGH"
    else: return "CRITICAL"

def predict(sample_list):

    try:
        data_scaled = scaler.transform(sample_list)
        x = torch.tensor(data_scaled, dtype=torch.float32).to(device)
        
        with torch.no_grad():
            logits = model(x)
            probs = torch.sigmoid(logits).cpu().numpy().flatten()
            
        results = []
        for p in probs:
            rp = float(p * 100)
            results.append({
                "risk_percent": round(rp, 2),
                "risk_class": risk_class_from_percent(rp)
            })
        return results
    except Exception as e:
        print(f"Ошибка при предсказании: {e}")
        return []

class RiskServiceServicer(risk_service_pb2_grpc.RiskServiceServicer):
    
    def PredictOne(self, request, context):

        sample = [
            request.depth, 
            request.length, 
            request.defect_type, 
            request.pressure, 
            request.diameter, 
            request.age,
            request.rms_vibration, 
            request.peak_vibration, 
            request.anomaly_score
        ]
        

        results = predict([sample])
        
        if not results:

            return risk_service_pb2.RiskResponse(risk_percent=-1.0, risk_class="ERROR")

        result = results[0]
        return risk_service_pb2.RiskResponse(
            risk_percent=result["risk_percent"],
            risk_class=result["risk_class"]
        )

    def PredictBatch(self, request, context):
        samples = []
        for req in request.requests:
            samples.append([
                req.depth, req.length, req.defect_type, 
                req.pressure, req.diameter, req.age,
                req.rms_vibration, req.peak_vibration, req.anomaly_score
            ])
            
        if not samples:
             return risk_service_pb2.RiskBatchResponse(responses=[])

        results = predict(samples)
        
        responses = []
        for res in results:
            responses.append(risk_service_pb2.RiskResponse(
                risk_percent=res["risk_percent"],
                risk_class=res["risk_class"]
            ))
            
        return risk_service_pb2.RiskBatchResponse(responses=responses)


def serve():
   
    load_artifacts()
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    risk_service_pb2_grpc.add_RiskServiceServicer_to_server(RiskServiceServicer(), server)
    

    server.add_insecure_port('[::]:9081')
    print(" gRPC 9081")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()