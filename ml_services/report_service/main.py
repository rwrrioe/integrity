import grpc
from concurrent import futures
import time
import integrity_protos.gen.python.reportsv2.reports_service_pb2_grpc as pb_grpc
from services.analytics import AnalyticsService

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb_grpc.add_AnalyticsServiceServicer_to_server(AnalyticsService(), server)
    
    address = f'[::]:9080'
    server.add_insecure_port(address)
    print(f"Analytics Python Service started on 9080")
    
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()