package service

import (
	"context"

	grpc_client "github.com/rwrrioe/integrity/backend/internal/clients/sensors/grpc"
	"github.com/rwrrioe/integrity/backend/internal/domain/entities"
	"github.com/rwrrioe/integrity/backend/internal/domain/requests"
	"github.com/rwrrioe/integrity/backend/internal/repository"
)

type ObjectProvider interface {
	GetObjectInfo(ctx context.Context, objectId uint) (*entities.ObjectFullInfo, error)
	GetDistrictInfo(ctx context.Context, districtId uint) (*entities.DistrictFullInfo, error)
	PredictCondition(ctx context.Context, objectId uint) (*entities.ConditionMessage, error)
}

type ObjectService struct {
	grpcClient      *grpc_client.Client
	objrepo         *repository.ObjectRepository
	defrepo         *repository.DefectRepository
	diagnosticsrepo *repository.DiagnosticRepository
}

func NewObjectService(objrepo *repository.ObjectRepository, defrepo *repository.DefectRepository, diagnosticsrepo *repository.DiagnosticRepository, grpcClient *grpc_client.Client) *ObjectService {
	return &ObjectService{
		objrepo:         objrepo,
		defrepo:         defrepo,
		diagnosticsrepo: diagnosticsrepo,
		grpcClient:      grpcClient,
	}
}

func (s *ObjectService) GetObjectInfo(ctx context.Context, objectId uint) (*entities.ObjectFullInfo, error) {
	object, err := s.objrepo.GetObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	defects, err := s.objrepo.ListDefects(ctx, objectId)
	if err != nil {
		return nil, err
	}

	employees, err := s.objrepo.ListEmployees(ctx, objectId)
	if err != nil {
		return nil, err
	}

	history, err := s.objrepo.GetProbabilityHistory(ctx, objectId)
	if err != nil {
		return nil, err
	}

	diagnostics, err := s.diagnosticsrepo.ListByObject(ctx, objectId)
	if err != nil {
		return nil, err
	}

	info := entities.ObjectFullInfo{
		Object:      *object,
		Employees:   *employees,
		Defect:      *defects,
		History:     *history,
		Diagnostics: *diagnostics,
	}
	return &info, nil
}

func (s *ObjectService) ExposeAlert(ctx context.Context, objectId uint) (*entities.ConditionMessage, error) {
	objStat, err := s.objrepo.GetAvgStatistics(ctx, objectId)
	if err != nil {
		return nil, err
	}

	resp, err := s.grpcClient.GetPrediction(ctx, &requests.PredictionRequest{
		ObjectId:      objectId,
		DefectType:    objStat.DefectType,
		Depth:         objStat.Depth,
		Pressure:      objStat.Pressure,
		Diameter:      objStat.Diameter,
		Age:           objStat.Age,
		RmsVibration:  objStat.RmsVibration,
		PeakVibration: objStat.PeakVibration,
		AnomalyScore:  objStat.AnomalyScore,
	})
	if err != nil {
		return nil, err
	}

	return &entities.ConditionMessage{
		ObjectId:    objectId,
		Condition:   resp.Class,
		Probability: resp.Probability,
	}, nil
}

func (s *ObjectService) AutoEmployeeAssign(ctx context.Context, defectId uint, num int) (*[]entities.Employee, error) {
	emps, err := s.objrepo.FindNearestEmployees(ctx, defectId, num)
	if err != nil {
		return nil, err
	}

	var employeeIds []uint
	for _, emp := range *emps {
		id := emp.EmployeeId
		employeeIds = append(employeeIds, id)
	}

	return emps, nil
}
