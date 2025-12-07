package entities

type ExecutiveReport struct {
	PipelineName    string               `json:"pipeline_name"`
	GeneratedAt     string               `json:"generated_at"`
	Stats           ExecutiveStats       `json:"stats"`
	KeyFindings     []string             `json:"key_findings"`
	Breakdown       []DefectBreakdownRow `json:"defect_breakdown"` // Таблица
	Recommendations []Recommendation     `json:"recommendations"`
	MapImageBase64  string               `json:"map_image_base64"` // Картинка
}

type ExecutiveStats struct {
	TotalDefects   int `json:"total_defects"`
	CriticalIssues int `json:"critical_issues"`
	Inspections    int `json:"inspections"`
	Resolved       int `json:"resolved"`
}

type DefectBreakdownRow struct {
	DefectType string `json:"defect_type"`
	Count      int    `json:"count"`
	Critical   int    `json:"critical"`
	High       int    `json:"high"`
	Medium     int    `json:"medium"`
	Low        int    `json:"low"`
}

type Recommendation struct {
	Priority    string `json:"priority"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// --- 2. Single Defect Report ---

type SingleDefectReport struct {
	DefectID       uint                `json:"defect_id"`
	Type           string              `json:"type"`
	Metrics        DefectReportMetrics `json:"metrics"`
	LlmSolution    string              `json:"llm_solution"`
	MapImageBase64 string              `json:"map_image_base64"`
}

type DefectReportMetrics struct {
	Depth    float64 `json:"depth"`
	Pressure float64 `json:"pressure"`
	Age      int     `json:"age"`
	Location string  `json:"location"`
}
