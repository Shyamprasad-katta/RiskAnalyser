package main

import (
	"db/handler"
	"db/repository"
	"db/usecase"
	"log"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	repo, err := repository.NewRiskRepository("risks.db")
	if err != nil {
		log.Println("Error initializing repository:", err)
		return
	}
	usecase := usecase.NewRiskUsecase(repo)
	h := handler.NewRiskHandler(usecase)
	e.GET("/v1/risks", h.GetRisks)
	e.POST("/v1/risks", h.CreateRisk)
	e.GET("/v1/risks/:id", h.GetRiskByID)

	if err := e.Start(":8080"); err != nil {
		log.Println("Server failed to start:", err)
	}
}
