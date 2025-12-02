package responses

type VibrationResponse struct {
	Anomaly     bool
	Severity    float64
	Description string
	RMS         float64
	Peak        float64
}
