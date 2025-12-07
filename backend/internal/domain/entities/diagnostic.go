package entities

import "time"

type METHOD int

const (
	VIK METHOD = iota
	PVK
	MPK
	UZK
	RGK
	TVK
	VIBRO
	MFL
	TFI
	GEO
	UTWM
)

type Diagnostic struct {
	DiagnosticId uint
	ObjectId     uint
	Method       METHOD
	Date         time.Time
	Temperature  float64
	Humidity     float64
	Illumination float64
}

type DiagnosticByYear struct {
	Count int
	Year  int
}

type DiagnosticByMethod struct {
	Count    int
	MethodId int `json:"method_id"`
	Method   string
}
