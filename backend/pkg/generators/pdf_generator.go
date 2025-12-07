package generators

import (
	"fmt"
	"strconv"
	"time"

	"github.com/johnfercher/maroto/pkg/color"
	"github.com/johnfercher/maroto/pkg/consts"
	"github.com/johnfercher/maroto/pkg/pdf"
	"github.com/johnfercher/maroto/pkg/props"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
)

type PDFGenerator struct{}

func NewPDFGenerator() *PDFGenerator {
	return &PDFGenerator{}
}

func (g *PDFGenerator) GenerateExecutive(data *entities.ExecutiveReport) ([]byte, error) {
	m := pdf.NewMaroto(consts.Portrait, consts.A4)
	m.SetPageMargins(10, 15, 10)

	// --- 1. Header ---
	buildHeader(m, "Defect Summary Report", data.PipelineName, data.GeneratedAt)

	// --- 2. Executive Summary Text ---
	m.Row(15, func() {
		m.Col(12, func() {
			m.Text("Executive Summary", props.Text{
				Size: 12, Style: consts.Bold, Top: 3, Family: consts.Arial,
			})
			m.Text(fmt.Sprintf("This report provides a comprehensive overview of pipeline integrity monitoring activities generated on %s.", data.GeneratedAt), props.Text{
				Size: 9, Top: 10, Family: consts.Arial,
			})
		})
	})

	// --- 3. Stats Cards (Цветные карточки) ---
	buildStatsGrid(m, data.Stats)

	// --- 4. Key Findings ---
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("Key Findings", props.Text{Size: 12, Style: consts.Bold, Top: 5})
		})
	})
	for _, finding := range data.KeyFindings {
		m.Row(6, func() {
			m.Col(12, func() {
				m.Text("• "+finding, props.Text{Size: 9, Left: 2})
			})
		})
	}

	m.Line(1.0)

	// --- 5. Map Section ---
	if data.MapImageBase64 != "" {
		m.Row(10, func() {
			m.Col(12, func() {
				m.Text("Site Map Visualization", props.Text{Size: 12, Style: consts.Bold, Top: 5})
			})
		})
		m.Row(80, func() {
			m.Col(12, func() {
				_ = m.Base64Image(data.MapImageBase64, consts.Png, props.Rect{
					Center:  true,
					Percent: 95,
				})
			})
		})
	}

	// Defect Breakdown Table ---
	buildBreakdownTable(m, data.Breakdown)

	// --- 7. Recommendations ---
	m.AddPage()
	buildRecommendations(m, data.Recommendations)

	// --- Footer ---
	buildFooter(m)

	buffer, err := m.Output()
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func (g *PDFGenerator) GenerateSingleDefect(data *entities.SingleDefectReport) ([]byte, error) {
	m := pdf.NewMaroto(consts.Portrait, consts.A4)
	m.SetPageMargins(10, 15, 10)

	// Header
	buildHeader(m, "Single Defect Analysis", fmt.Sprintf("Defect ID: %d | Type: %s", data.DefectID, data.Type), time.Now().Format("2006-01-02"))

	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("Defect Metrics", props.Text{Size: 12, Style: consts.Bold, Top: 5})
		})
	})

	m.Row(20, func() {
		// Card 1: Depth
		m.Col(3, func() {
			buildMetricCard(m, "Depth", fmt.Sprintf("%.2f %%", data.Metrics.Depth))
		})
		// Card 2: Pressure
		m.Col(3, func() {
			buildMetricCard(m, "Pressure", fmt.Sprintf("%.1f bar", data.Metrics.Pressure))
		})
		// Card 3: Age
		m.Col(3, func() {
			buildMetricCard(m, "Pipe Age", fmt.Sprintf("%d years", data.Metrics.Age))
		})
		// Card 4: Location
		m.Col(3, func() {
			buildMetricCard(m, "Location", "Geo-tag")
		})
	})

	m.Line(1.0)

	if data.MapImageBase64 != "" {
		m.Row(60, func() {
			m.Col(6, func() {
				_ = m.Base64Image(data.MapImageBase64, consts.Png, props.Rect{
					Center:  true,
					Percent: 95,
				})
			})
			m.Col(6, func() {
				m.Text("Defect Localization", props.Text{Style: consts.Bold, Top: 5})
				m.Text("The map shows the precise location of the detected anomaly with a zoomed view of the surrounding pipeline segment.", props.Text{
					Top: 15, Size: 9,
				})
			})
		})
	}

	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("AI Technical Assessment & Solution", props.Text{Size: 12, Style: consts.Bold, Top: 5})
		})
	})

	m.Row(100, func() {
		m.Col(12, func() {
			m.Text(data.LlmSolution, props.Text{
				Size:   10,
				Top:    5,
				Align:  consts.Left,
				Family: consts.Arial,
			})
		})
	})

	buildFooter(m)

	buffer, err := m.Output()
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func buildHeader(m pdf.Maroto, title, subtitle, date string) {
	// Blue background header
	m.SetBackgroundColor(color.Color{Red: 41, Green: 98, Blue: 255})
	m.Row(25, func() {
		m.Col(2, func() {
			// Icon placeholder
			m.Text("📄", props.Text{Size: 14, Top: 5, Align: consts.Center, Color: color.NewWhite()})
		})
		m.Col(10, func() {
			m.Text(title, props.Text{
				Top:   5,
				Size:  14,
				Color: color.NewWhite(),
				Style: consts.Bold,
			})
			m.Text(fmt.Sprintf("%s | Generated: %s", subtitle, date), props.Text{
				Top:   14,
				Size:  9,
				Color: color.NewWhite(),
			})
		})
	})
	m.SetBackgroundColor(color.NewWhite()) // Reset to white
	m.Row(5, func() {})                    // Spacer
}

func buildStatsGrid(m pdf.Maroto, stats entities.ExecutiveStats) {
	m.Row(25, func() {
		// 1. Total Defects (Red Light)
		m.Col(3, func() {
			drawColorCard(m, "Total Defects", strconv.Itoa(stats.TotalDefects),
				color.Color{Red: 255, Green: 235, Blue: 238}, // Light Red BG
				color.Color{Red: 211, Green: 47, Blue: 47})   // Dark Red Text
		})
		// 2. Critical Issues (Orange Light)
		m.Col(3, func() {
			drawColorCard(m, "Critical Issues", strconv.Itoa(stats.CriticalIssues),
				color.Color{Red: 255, Green: 243, Blue: 224}, // Light Orange BG
				color.Color{Red: 230, Green: 81, Blue: 0})    // Dark Orange Text
		})
		// 3. Inspections (Blue Light)
		m.Col(3, func() {
			drawColorCard(m, "Inspections", strconv.Itoa(stats.Inspections),
				color.Color{Red: 227, Green: 242, Blue: 253}, // Light Blue BG
				color.Color{Red: 25, Green: 118, Blue: 210})  // Dark Blue Text
		})
		// 4. Resolved (Green Light)
		m.Col(3, func() {
			drawColorCard(m, "Resolved", strconv.Itoa(stats.Resolved),
				color.Color{Red: 232, Green: 245, Blue: 233}, // Light Green BG
				color.Color{Red: 56, Green: 142, Blue: 60})   // Dark Green Text
		})
	})
	m.Row(5, func() {}) // Spacer
}

func drawColorCard(m pdf.Maroto, title, value string, bg, textCol color.Color) {
	m.SetBackgroundColor(bg)
	m.Row(25, func() {
		m.Col(12, func() {
			m.Text(title, props.Text{Size: 8, Top: 3, Align: consts.Left, Left: 3, Color: color.Color{Red: 80, Green: 80, Blue: 80}})
			m.Text(value, props.Text{Size: 14, Top: 10, Style: consts.Bold, Align: consts.Left, Left: 3, Color: textCol})
		})
	})
	m.SetBackgroundColor(color.NewWhite()) // Reset
}

func buildMetricCard(m pdf.Maroto, title, value string) {
	m.SetBackgroundColor(color.Color{Red: 245, Green: 245, Blue: 245})

	m.Row(25, func() {
		m.Col(12, func() {
			// Заголовок (Title)
			m.Text(title, props.Text{
				Size:   8,
				Top:    4, // Отступ сверху внутри ячейки
				Align:  consts.Center,
				Color:  color.Color{Red: 100, Green: 100, Blue: 100},
				Family: consts.Arial,
				Style:  consts.Normal,
			})

			// Значение (Value)
			m.Text(value, props.Text{
				Size:   11,
				Top:    12, // Опускаем ниже заголовка
				Align:  consts.Center,
				Style:  consts.Bold,
				Family: consts.Arial,
				Color:  color.NewBlack(),
			})
		})
	})

	m.SetBackgroundColor(color.NewWhite()) // Сброс фона
}

func buildBreakdownTable(m pdf.Maroto, rows []entities.DefectBreakdownRow) {
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("Defect Breakdown", props.Text{Size: 12, Style: consts.Bold, Top: 5})
		})
	})

	header := []string{"Defect Type", "Count", "Critical", "High", "Medium", "Low"}
	var contents [][]string

	for _, r := range rows {
		contents = append(contents, []string{
			r.DefectType,
			strconv.Itoa(r.Count),
			strconv.Itoa(r.Critical),
			strconv.Itoa(r.High),
			strconv.Itoa(r.Medium),
			strconv.Itoa(r.Low),
		})
	}

	m.TableList(header, contents, props.TableList{
		HeaderProp: props.TableListContent{
			Size:      9,
			GridSizes: []uint{4, 2, 2, 2, 1, 1},
			Family:    consts.Arial,
			Style:     consts.Bold,
			Color:     color.Color{Red: 80, Green: 80, Blue: 80}, // Dark Grey Text
		},
		ContentProp: props.TableListContent{
			Size:      9,
			GridSizes: []uint{4, 2, 2, 2, 1, 1},
			Family:    consts.Arial,
		},
		Align:                consts.Center,
		HeaderContentSpace:   2,
		Line:                 false,                                         // No vertical lines
		AlternatedBackground: &color.Color{Red: 250, Green: 250, Blue: 250}, // Zebra striping
	})
}

func buildRecommendations(m pdf.Maroto, recs []entities.Recommendation) {
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("Recommendations", props.Text{Size: 12, Style: consts.Bold, Top: 5})
		})
	})

	for _, r := range recs {
		// Выбор цвета рамки и фона в зависимости от приоритета
		var borderColor color.Color
		var bgColor color.Color

		if r.Priority == "High Priority" {
			borderColor = color.Color{Red: 255, Green: 152, Blue: 0} // Orange Border
			bgColor = color.Color{Red: 255, Green: 243, Blue: 224}   // Light Orange BG
		} else {
			borderColor = color.Color{Red: 33, Green: 150, Blue: 243} // Blue Border
			bgColor = color.Color{Red: 227, Green: 242, Blue: 253}    // Light Blue BG
		}

		m.SetBackgroundColor(bgColor)
		m.Row(25, func() {
			// Левая цветная полоса
			m.Col(12, func() {
				// Hack for border: Draw text with background
				m.Text(r.Priority, props.Text{
					Top: 3, Left: 3, Size: 8, Style: consts.Bold, Color: borderColor,
				})
				m.Text(r.Title, props.Text{
					Top: 8, Left: 3, Size: 10,
				})
				m.Text(r.Description, props.Text{
					Top: 16, Left: 3, Size: 9, Style: consts.Italic, Color: color.Color{Red: 100, Green: 100, Blue: 100},
				})
			})
		})
		m.SetBackgroundColor(color.NewWhite())
		m.Row(3, func() {}) // Spacer
	}
}

func buildFooter(m pdf.Maroto) {
	m.RegisterFooter(func() {
		m.Row(10, func() {
			m.Col(12, func() {
				m.Text("Integrity Monitoring System | Confidential", props.Text{
					Top:   3,
					Size:  8,
					Align: consts.Center,
					Color: color.Color{Red: 150, Green: 150, Blue: 150},
				})
			})
		})
	})
}
