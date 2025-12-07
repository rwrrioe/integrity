package responses

type PredictionResponse struct {
	ObjectId    uint
	Class       string
	Probability float64
}
