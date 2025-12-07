package entities

type MonthlyProbability struct {
	AvgProbability float64 `json:"probability"`
	Month          string  `json:"month"`
}
