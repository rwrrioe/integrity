package main

import (
	"context"
	"fmt"
	"log"
	"time"

	grpc_client "github.com/rwrrioe/integrity/backend/internal/clients/sensors/grpc"
	"github.com/rwrrioe/integrity/backend/internal/database"
	"github.com/rwrrioe/integrity/backend/internal/repository"
	"github.com/rwrrioe/integrity/backend/internal/service"
	"github.com/rwrrioe/integrity/backend/internal/storage"
	"github.com/rwrrioe/integrity/backend/internal/transport/rest"
	"github.com/rwrrioe/integrity/backend/internal/transport/ws/ws_hub"
	"github.com/rwrrioe/integrity/backend/pkg/generators"
	v2 "github.com/rwrrioe/integrity_protos/gen/go/reportsv2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	op := "main.go"
	db, err := database.DbConnect()
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	hub := ws_hub.NewWebSocketHub()
	redis := storage.NewRedisStorage("6379", time.Hour)

	defectRepo := repository.NewDefectRepo(db)

	predictionClient, err := grpc_client.NewClient(ctx, "9081", time.Hour, 10)
	if err != nil {
		log.Fatal(err)
	}

	objRepo := repository.NewObjectRepository(db)
	diagRepo := repository.NewDiagnosticRepository(db)
	objService := service.NewObjectService(objRepo, defectRepo, diagRepo, predictionClient)

	defectService := service.NewDefectService(defectRepo, redis)
	hmapService := service.NewHeatmapService(redis, defectRepo)

	reportRepo := repository.NewReportRepository(db)
	gen := generators.NewPDFGenerator()

	cc, err := grpc.NewClient("9080", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		fmt.Errorf("%s:%w", op, err)
	}
	inspectionRepo := repository.NewDiagnosticRepository(db)
	inspectionService := service.NewInspectionService(inspectionRepo, redis)
	reportClient := v2.NewAnalyticsServiceClient(cc)
	reportService := service.NewReportService(reportRepo, reportClient, gen)
	parser := service.NewScvParser(*redis, db)

	h := rest.NewHandler(defectService, defectRepo, hmapService, objService, inspectionService, parser, redis, reportService, hub)
	engine := h.InitRoutes()
	engine.Run()
}
