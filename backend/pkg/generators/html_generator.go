package generators

import (
	"bytes"
	"fmt"
	"html/template"

	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
)

type HTMLGenerator struct{}

func NewHTMLGenerator() *HTMLGenerator {
	return &HTMLGenerator{}
}

// GenerateExecutive
func (g *HTMLGenerator) GenerateExecutive(data *entities.ExecutiveReport) ([]byte, error) {
	funcMap := template.FuncMap{
		"isHighPriority": func(p string) bool {
			return p == "High Priority" || p == "Critical"
		},
	}

	t, err := template.New("executive_report").Funcs(funcMap).Parse(executiveTemplate)
	if err != nil {
		return nil, fmt.Errorf("failed to parse html template: %w", err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return nil, fmt.Errorf("failed to execute html template: %w", err)
	}

	return buf.Bytes(), nil
}

// GenerateSingleDefect
func (g *HTMLGenerator) GenerateSingleDefect(data *entities.SingleDefectReport) ([]byte, error) {
	t, err := template.New("single_defect").Parse(singleDefectTemplate)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

const executiveTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Defect Summary Report</title>
    <style>
        :root {
            --primary-blue: #2962FF;
            --bg-gray: #f4f6f9;
            --card-red-bg: #ffebee; --card-red-text: #d32f2f;
            --card-orange-bg: #fff3e0; --card-orange-text: #e65100;
            --card-blue-bg: #e3f2fd; --card-blue-text: #1976d2;
            --card-green-bg: #e8f5e9; --card-green-text: #388e3c;
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: var(--bg-gray); color: #333; }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden; }
        
        /* Header */
        .header { background-color: var(--primary-blue); color: white; padding: 25px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }

        /* Content */
        .content { padding: 30px; }
        h3 { color: #2c3e50; font-size: 16px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3:first-child { margin-top: 0; }
        
        .summary-text { font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 25px; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { padding: 15px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.05); }
        .stat-label { font-size: 12px; font-weight: 600; margin-bottom: 5px; color: #555; }
        .stat-value { font-size: 24px; font-weight: bold; }
        
        .stat-red { background-color: var(--card-red-bg); }
        .stat-red .stat-value { color: var(--card-red-text); }
        
        .stat-orange { background-color: var(--card-orange-bg); }
        .stat-orange .stat-value { color: var(--card-orange-text); }
        
        .stat-blue { background-color: var(--card-blue-bg); }
        .stat-blue .stat-value { color: var(--card-blue-text); }
        
        .stat-green { background-color: var(--card-green-bg); }
        .stat-green .stat-value { color: var(--card-green-text); }

        /* Key Findings */
        .findings-list { padding-left: 20px; font-size: 14px; line-height: 1.6; }
        .findings-list li { margin-bottom: 5px; }

        /* Map */
        .map-container { text-align: center; margin: 20px 0; border: 1px solid #ddd; padding: 5px; border-radius: 4px; }
        .map-container img { max-width: 100%; height: auto; display: block; }

        /* Breakdown Table */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background-color: #f8f9fa; font-weight: 600; text-align: left; padding: 10px; border-bottom: 2px solid #eee; color: #666; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background-color: #fafafa; }

        /* Recommendations */
        .rec-item { padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left-width: 4px; border-left-style: solid; }
        
        .rec-high { background-color: #fff3e0; border-left-color: #ff9800; }
        .rec-high .rec-title { color: #e65100; }
        
        .rec-med { background-color: #e3f2fd; border-left-color: #2196f3; }
        .rec-med .rec-title { color: #1565c0; }

        .rec-priority { font-size: 11px; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; opacity: 0.8; }
        .rec-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
        .rec-desc { font-size: 13px; color: #555; }

        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Defect Summary Report</h1>
            <p>Pipeline: {{.PipelineName}} &bull; Generated: {{.GeneratedAt}}</p>
        </div>

        <div class="content">
            <h3>Executive Summary</h3>
            <div class="summary-text">
                This report provides a comprehensive overview of pipeline integrity monitoring activities.
            </div>

            <div class="stats-grid">
                <div class="stat-card stat-red">
                    <div class="stat-label">Total Defects</div>
                    <div class="stat-value">{{.Stats.TotalDefects}}</div>
                </div>
                <div class="stat-card stat-orange">
                    <div class="stat-label">Critical Issues</div>
                    <div class="stat-value">{{.Stats.CriticalIssues}}</div>
                </div>
                <div class="stat-card stat-blue">
                    <div class="stat-label">Inspections</div>
                    <div class="stat-value">{{.Stats.Inspections}}</div>
                </div>
                <div class="stat-card stat-green">
                    <div class="stat-label">Resolved</div>
                    <div class="stat-value">{{.Stats.Resolved}}</div>
                </div>
            </div>

            <h3>Key Findings</h3>
            <ul class="findings-list">
                {{range .KeyFindings}}
                <li>{{.}}</li>
                {{end}}
            </ul>

            {{if .MapImageBase64}}
            <h3>Site Map Visualization</h3>
            <div class="map-container">
                <img src="data:image/png;base64,{{.MapImageBase64}}" alt="Pipeline Map" />
            </div>
            {{end}}

            <h3>Defect Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Defect Type</th>
                        <th>Count</th>
                        <th>Critical</th>
                        <th>High</th>
                        <th>Medium</th>
                        <th>Low</th>
                    </tr>
                </thead>
                <tbody>
                    {{range .Breakdown}}
                    <tr>
                        <td>{{.DefectType}}</td>
                        <td>{{.Count}}</td>
                        <td>{{.Critical}}</td>
                        <td>{{.High}}</td>
                        <td>{{.Medium}}</td>
                        <td>{{.Low}}</td>
                    </tr>
                    {{end}}
                </tbody>
            </table>

            <h3>Recommendations</h3>
            {{range .Recommendations}}
            <div class="rec-item {{if isHighPriority .Priority}}rec-high{{else}}rec-med{{end}}">
                <div class="rec-priority">{{.Priority}}</div>
                <div class="rec-title">{{.Title}}</div>
                <div class="rec-desc">{{.Description}}</div>
            </div>
            {{end}}

            <div class="footer">
                Integrity Monitoring System | Confidential Report
            </div>
        </div>
    </div>
</body>
</html>
`

const singleDefectTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Single Defect Report</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
        .container { max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 8px; }
        .header { border-bottom: 2px solid #2962FF; padding-bottom: 10px; margin-bottom: 20px; }
        .metrics { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .metric-box { background: #f8f9fa; padding: 15px; width: 22%; text-align: center; border-radius: 5px; border: 1px solid #ddd; }
        .metric-val { font-size: 18px; font-weight: bold; color: #333; }
        .ai-section { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 5px solid #2962FF; white-space: pre-wrap; }
        img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Defect Analysis #{{.DefectID}}</h1>
            <p>Type: {{.Type}}</p>
        </div>

        <div class="metrics">
            <div class="metric-box">
                <div>Depth</div>
                <div class="metric-val">{{printf "%.2f" .Metrics.Depth}}%</div>
            </div>
            <div class="metric-box">
                <div>Pressure</div>
                <div class="metric-val">{{.Metrics.Pressure}} bar</div>
            </div>
            <div class="metric-box">
                <div>Age</div>
                <div class="metric-val">{{.Metrics.Age}} yrs</div>
            </div>
            <div class="metric-box">
                <div>Status</div>
                <div class="metric-val" style="color:red">Active</div>
            </div>
        </div>

        {{if .MapImageBase64}}
        <h3>Defect Location</h3>
        <img src="data:image/png;base64,{{.MapImageBase64}}" />
        {{end}}

        <h3>AI Solution & Assessment</h3>
        <div class="ai-section">
            {{.LlmSolution}}
        </div>
    </div>
</body>
</html>
`
