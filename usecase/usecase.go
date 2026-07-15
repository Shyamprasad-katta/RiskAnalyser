package usecase

import (
	"time"

	"db/model"
	"db/repository"
)

// RiskUsecase holds business logic that sits between the HTTP layer (handler)
// and the storage layer (repository). Handlers never talk to the repository
// directly — they only depend on this interface.
type RiskUsecase interface {
	GetRisks() ([]model.Risk, error)
	GetRiskByID(id string) (model.Risk, bool)
	CreateRisk(risk model.Risk) error
}

type riskUsecase struct {
	repo repository.RiskRepository
}

func NewRiskUsecase(repo repository.RiskRepository) RiskUsecase {
	return &riskUsecase{repo: repo}
}

func (u *riskUsecase) GetRisks() ([]model.Risk, error) {
	return u.repo.GetAll()
}

func (u *riskUsecase) GetRiskByID(id string) (model.Risk, bool) {
	return u.repo.GetByID(id)
}

// CreateRisk applies defaults/validation before delegating to the repository.
// This is where business rules belong (e.g. defaulting CreatedAt, validating
// Level is one of a known set) — the repository itself should stay a thin
// storage layer with no business logic.
func (u *riskUsecase) CreateRisk(risk model.Risk) error {
	if risk.CreatedAt == "" {
		risk.CreatedAt = time.Now().Format(time.RFC3339)
	}
	return u.repo.Create(risk)
}
