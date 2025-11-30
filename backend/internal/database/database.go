package database

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/rwrrioe/integrity/backend/internal/repository/models"
	"google.golang.org/genai"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const prompt = `Ты профессиональный инженер и архитектор систем мониторинга промышленного оборудования. Твоя задача — сгенерировать JSON с данными для одного промышленного объекта в Казахстане. Структура данных:

1. object — объект
   - object_id: строка (UUID)
   - name: строка
   - description: строка
   - address: строка

2. employees — массив сотрудников
   - employee_id: число (уникальный ID)
   - first_name: строка
   - last_name: строка
   - role: число (смотри описание ролей ниже)
   - phone: строка

   **Описание ролей (role):**
   - 1: Инженер
   - 2: Техник
   - 3: Оператор
   - 4: Менеджер
   - 5: Специалист по безопасности

3. devices — массив устройств
   - device_id: строка (UUID)
   - name: строка
   - description: строка
   - condition: число (от 0 до 100, состояние устройства)
   - status: строка ("OK", "Warning", "Critical")
   - last_repaired: строка в формате ISO 8601 (например "2025-11-29T15:04:05Z")

4. tasks — массив задач
   - task_id: число
   - device_id: строка (UUID устройства)
   - object_id: строка (UUID объекта)
   - name: строка
   - description: строка
   - occurred_at: строка ISO 8601
   - solved_at: строка ISO 8601 или null
   - importance: число (0–10)
   - status: строка ("Open", "InProgress", "Solved")
   - assigned_to: число (employee_id)

**Требования:**
- Все внешние ключи должны корректно ссылаться на существующие объекты/устройства/сотрудников.
- Поля "object_id" и "device_id" генерировать как UUID.
- Поля дат ("last_repaired", "occurred_at", "solved_at") должны быть валидными ISO 8601.
- JSON должен быть строго по схеме: object, employees, devices, tasks.
- Каждый массив должен содержать хотя бы 5-10 элементов.
- Придумай реалистичные имена, описания и номера телефонов.
- Дай короткое описание задачи в поле description и realistic importance.
- Используй корректные связи между задачами и устройствами/сотрудниками.
- Сгенерируй оборудование к которому будут уместны акселлерометры, датчики вибрации для отслеживания активности.
- Следуй указанным ниже кодировкам при заполнении ролей в employees
    {RoleId: 1, Name: "Инженер", Description: "Инженер по эксплуатации"},
    {RoleId: 2, Name: "Техник", Description: "Технический специалист"},
    {RoleId: 3, Name: "Начальник смены", Description: "Руководитель участка"},
    {RoleId: 4, Name: "Инспектор", Description: "Проверяющий"},
    {RoleId: 5, Name: "Оператор", Description: "Оператор оборудования"}.
- Верни только JSON, никаких комментариев или пояснений.
`

func DbConnect() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	if host == "" || user == "" || dbname == "" || port == "" {
		return nil, fmt.Errorf("missing DB env variables: host=%s user=%s dbname=%s port=%s", host, user, dbname, port)
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func DbMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.Role{}, &models.Object{}, &models.Device{}, &models.Employee{}, &models.Task{})
}

func GenerateContent(ctx context.Context, db *gorm.DB, client genai.Client) error {
	var response GenerateContentResponse
	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"object": {
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"object_id":   {Type: genai.TypeString},
						"name":        {Type: genai.TypeString},
						"description": {Type: genai.TypeString},
						"address":     {Type: genai.TypeString},
					},
					Required: []string{"name", "description", "address"},
				},

				"employees": {
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"employee_id": {Type: genai.TypeInteger},
							"first_name":  {Type: genai.TypeString},
							"last_name":   {Type: genai.TypeString},
							"role":        {Type: genai.TypeInteger},
							"phone":       {Type: genai.TypeString},
						},
						Required: []string{"employee_id", "first_name", "last_name", "role", "phone"},
					},
				},

				"devices": {
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"device_id":     {Type: genai.TypeString},
							"name":          {Type: genai.TypeString},
							"description":   {Type: genai.TypeString},
							"condition":     {Type: genai.TypeNumber},
							"status":        {Type: genai.TypeString},
							"last_repaired": {Type: genai.TypeString},
						},
						Required: []string{"device_id", "name", "description", "condition", "status", "last_repaired"},
					},
				},

				"tasks": {
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"task_id":     {Type: genai.TypeInteger},
							"device_id":   {Type: genai.TypeString},
							"object_id":   {Type: genai.TypeString},
							"name":        {Type: genai.TypeString},
							"description": {Type: genai.TypeString},
							"occurred_at": {Type: genai.TypeString},
							"solved_at":   {Type: genai.TypeString},
							"importance":  {Type: genai.TypeNumber},
							"status":      {Type: genai.TypeString},
							"assigned_to": {Type: genai.TypeInteger},
						},
					},
				},
			},
			Required: []string{"object", "devices", "tasks", "employees"},
		},
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-pro",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return fmt.Errorf("failed to generate AI response:%w", err)
	}

	if err := json.Unmarshal([]byte(result.Text()), &response); err != nil {
		return fmt.Errorf("failed to unmarshal AI response:%w", err)
	}

	objId := uuid.New()
	object := models.Object{
		ObjectId:    objId,
		Name:        response.Object.Name,
		Description: response.Object.Description,
		Address:     response.Object.Address,
	}

	db.Create(&object)

	deviceIdMap := make(map[string]uuid.UUID)

	var devices []models.Device
	for k, d := range response.Devices {
		newUUID := uuid.New()
		deviceIdMap[d.DeviceID] = newUUID
		date, err := time.Parse(time.RFC3339, d.LastRepaired)

		if err != nil {
			fmt.Printf("error on %d, failed to convert time %s", k, d.LastRepaired)
			break
		}

		device := models.Device{
			DeviceId:     newUUID,
			ObjectId:     objId,
			Name:         d.Name,
			Description:  d.Description,
			Condition:    d.Condition,
			Status:       d.Status,
			LastRepaired: &date,
		}

		devices = append(devices, device)
	}
	db.Create(&devices)

	roles := []models.Role{
		{RoleId: 1, Name: "Инженер", Description: "Инженер по эксплуатации"},
		{RoleId: 2, Name: "Техник", Description: "Технический специалист"},
		{RoleId: 3, Name: "Начальник смены", Description: "Руководитель участка"},
		{RoleId: 4, Name: "Инспектор", Description: "Проверяющий"},
		{RoleId: 5, Name: "Оператор", Description: "Оператор оборудования"},
	}

	db.Create(&roles)

	var employees []models.Employee
	for _, e := range response.Employees {
		employee := models.Employee{
			EmployeeId: uint(e.EmployeeID),
			FirstName:  e.FirstName,
			LastName:   e.LastName,
			Phone:      e.Phone,
			ObjectId:   objId,
			RoleId:     uint(e.Role),
		}
		employees = append(employees, employee)
	}
	db.Create(&employees)
	var tasks []models.Task
	for _, t := range response.Tasks {

		mappedDeviceId, ok := deviceIdMap[t.DeviceID]
		if !ok {
			fmt.Printf("task references unknown device %s\n", t.DeviceID)
			continue
		}

		occurred, _ := time.Parse(time.RFC3339, t.OccurredAt)
		solved, _ := time.Parse(time.RFC3339, t.SolvedAt)

		task := models.Task{
			TaskId:      uint(t.TaskID),
			DeviceId:    mappedDeviceId,
			ObjectId:    objId,
			Name:        t.Name,
			Description: t.Description,
			CreatedAt:   occurred,
			SolvedAt:    &solved,
			Importance:  t.Importance,
			Status:      t.Status,
			AssignedTo:  uint(t.AssignedTo),
		}

		tasks = append(tasks, task)
	}
	db.Create(&tasks)

	return nil
}
