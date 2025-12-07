package grpc_client

import (
	"context"
	"fmt"
	"time"

	"github.com/rwrrioe/integrity/backend/internal/domain/requests"
	"github.com/rwrrioe/integrity/backend/internal/domain/responses"
	v1 "github.com/rwrrioe/integrity_protos/gen/go/anomaly_detection"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	api v1.RiskServiceClient
}

func NewClient(
	ctx context.Context,
	addr string,
	timeout time.Duration,
	retriesCount int,
) (*Client, error) {
	const op = "grpc.New"

	cc, err := grpc.NewClient(addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)

	if err != nil {
		return nil, fmt.Errorf("%s:%w", op, err)
	}

	grpcClient := v1.NewRiskServiceClient(cc)

	return &Client{
		api: grpcClient,
	}, nil
}

func (c *Client) GetPrediction(ctx context.Context, req *requests.PredictionRequest) (*responses.PredictionResponse, error) {
	op := "grpc.Predict"

	resp, err := c.api.PredictOne(ctx, &v1.RiskRequest{
		Depth:         req.Depth,
		DefectType:    req.DefectType,
		Pressure:      req.Pressure,
		Diameter:      req.Diameter,
		Age:           req.Age,
		RmsVibration:  req.RmsVibration,
		PeakVibration: req.PeakVibration,
		AnomalyScore:  req.AnomalyScore,
	})

	if err != nil {
		return nil, fmt.Errorf("%s:%w", op, err)
	}

	return &responses.PredictionResponse{
		ObjectId:    req.ObjectId,
		Probability: float64(resp.RiskPercent),
		Class:       resp.RiskClass,
	}, nil

}
