package grpc_sensor

import (
	"context"
	"fmt"
	"time"

	"github.com/rwrrioe/integrity/backend/internal/domain/requests"
	"github.com/rwrrioe/integrity/backend/internal/domain/responses"
	anomalydetv1 "github.com/rwrrioe/integrity_protos/gen/go/anomaly_detection"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	api anomalydetv1.AnomalyDetectionClient
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

	grpcClient := anomalydetv1.NewAnomalyDetectionClient(cc)

	return &Client{
		api: grpcClient,
	}, nil
}

func (c *Client) AnalyzeVibration(ctx context.Context, req *requests.VibrationRequest) (*responses.VibrationResponse, error) {
	op := "grpc.AnalyzeVibration"

	resp, err := c.api.AnalyzeVibration(ctx, &anomalydetv1.VibrationRequest{
		DeviceId: req.DeviceId.String(),
		AccelX:   req.AccelX,
		AccelY:   req.AccelY,
		AccelZ:   req.AccelZ,
	})

	if err != nil {
		return nil, fmt.Errorf("%s:%w", op, err)
	}

	return &responses.VibrationResponse{
		Anomaly:     resp.Anomaly,
		Severity:    resp.Severity,
		Description: resp.Description,
		RMS:         resp.Rms,
		Peak:        resp.Peak,
	}, nil

}
