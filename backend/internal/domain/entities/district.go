package entities

type DistrictFullInfo struct {
	EmployeesCount  int
	ObjectCount     int
	InspectionCount int
	AvgSeverity     float64
	DefectCount     int

	Condition float64
}
