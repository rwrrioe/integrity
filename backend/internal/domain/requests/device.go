package requests

type CreateDeviceRequest struct {
	Name        string
	Description string
	Condition   float64
	Status      string
}

type UpdateDeviceRequest struct {
	DeviceId    uint
	UpdateField string
	Value       interface{}
}
