package entities

type HeatPoint struct {
	Id     uint
	Class  uint
	Weight float64
	Lon    float64
	Lat    float64
}

type Heatmap struct {
	HeatPoints []HeatPoint
}
