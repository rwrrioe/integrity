package requests

type PredictionRequest struct {
	ObjectId      uint
	DefectType    int32
	Depth         float32
	Pressure      float32
	Diameter      int32
	Age           int32
	RmsVibration  float32
	PeakVibration float32
	AnomalyScore  float32
}
