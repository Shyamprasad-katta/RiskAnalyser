package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"db/model"
	"db/repository"
	"db/usecase"
)

// RiskHandler holds the HTTP handlers for risk endpoints.
// It only depends on the usecase layer, never on the repository directly.
type RiskHandler struct {
	usecase usecase.RiskUsecase
}

func NewRiskHandler(u usecase.RiskUsecase) *RiskHandler {
	return &RiskHandler{usecase: u}
}

func (h *RiskHandler) GetRisks(c echo.Context) error {
	risks, err := h.usecase.GetRisks()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, risks)
}

func (h *RiskHandler) GetRiskByID(c echo.Context) error {
	id := c.Param("id")
	risk, ok := h.usecase.GetRiskByID(id)
	if !ok {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "risk not found"})
	}
	return c.JSON(http.StatusOK, risk)
}

func (h *RiskHandler) CreateRisk(c echo.Context) error {
	var risk model.Risk
	if err := c.Bind(&risk); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if risk.ID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "id is required"})
	}

	if err := h.usecase.CreateRisk(risk); err != nil {
		if errors.Is(err, repository.ErrRiskExists) {
			return c.JSON(http.StatusConflict, echo.Map{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, risk)
}
