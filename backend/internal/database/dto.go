package database

type ObjectDTO struct {
	ObjectID    string `json:"object_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Address     string `json:"address"`
}

type EmployeeDTO struct {
	EmployeeID int    `json:"employee_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Role       int    `json:"role"`
	Phone      string `json:"phone"`
}

type DeviceDTO struct {
	DeviceID     string  `json:"device_id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Condition    float64 `json:"condition"`
	Status       string  `json:"status"`
	LastRepaired string  `json:"last_repaired"`
}

type TaskDTO struct {
	TaskID      int     `json:"task_id"`
	DeviceID    string  `json:"device_id"`
	ObjectID    string  `json:"object_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	OccurredAt  string  `json:"occurred_at"`
	SolvedAt    string  `json:"solved_at"`
	Importance  float64 `json:"importance"`
	Status      string  `json:"status"`
	AssignedTo  int     `json:"assigned_to"`
}

type GenerateContentResponse struct {
	Object    ObjectDTO     `json:"object"`
	Employees []EmployeeDTO `json:"employees"`
	Devices   []DeviceDTO   `json:"devices"`
	Tasks     []TaskDTO     `json:"tasks"`
}
