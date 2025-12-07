package entities

type Object struct {
	ObjectId uint
	Name     string
	Lon      float64
	Lat      float64
	Material string
}

type ObjectFullInfo struct {
	Object      Object               `json:"object"`
	Employees   []Employee           `json:"employees"`
	Defect      []Defect             `json:"defects"`
	Diagnostics []Diagnostic         `json:"diagnostics"`
	History     []MonthlyProbability `json:"motnhly_probability"`
	Sensors     []Sensor             `json:"sensors"`
}
