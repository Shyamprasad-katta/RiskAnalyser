package repository

import (
	"database/sql"
	"db/model"
	"errors"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

var ErrRiskExists = errors.New("risk already exists")

type RiskRepository interface {
	GetAll() ([]model.Risk, error)
	GetByID(id string) (model.Risk, bool)
	Create(risk model.Risk) error
}
type riskRepository struct {
	db *sql.DB
}

func NewRiskRepository(dbPath string) (RiskRepository, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	if err := createSchema(db); err != nil {
		db.Close()
		return nil, err
	}
	return &riskRepository{db: db}, nil
}
func createSchema(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS risks (
			id          TEXT PRIMARY KEY,
			name        TEXT NOT NULL,
			description TEXT,
			level       TEXT,
			created_at  TEXT
		)
	`)
	return err
}
func (r *riskRepository) GetAll() ([]model.Risk, error) {
	rows, err := r.db.Query(`SELECT id, name, description, level, created_at FROM risks`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var risks []model.Risk
	for rows.Next() {
		var risk model.Risk
		if err := rows.Scan(&risk.ID, &risk.Name, &risk.Description, &risk.Level, &risk.CreatedAt); err != nil {
			return nil, err
		}
		risks = append(risks, risk)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return risks, nil
}

func (r *riskRepository) GetByID(id string) (model.Risk, bool) {
	var risk model.Risk
	row := r.db.QueryRow(
		`SELECT id, name, description, level, created_at FROM risks WHERE id = ?`,
		id,
	)
	err := row.Scan(&risk.ID, &risk.Name, &risk.Description, &risk.Level, &risk.CreatedAt)
	if err != nil {
		return model.Risk{}, false
	}
	return risk, true
}

func (r *riskRepository) Create(risk model.Risk) error {
	_, err := r.db.Exec(
		`INSERT INTO risks (id, name, description, level, created_at) VALUES (?, ?, ?, ?, ?)`,
		risk.ID, risk.Name, risk.Description, risk.Level, risk.CreatedAt,
	)
	if err != nil {
		if isUniqueConstraintErr(err) {
			return ErrRiskExists
		}
		return err
	}
	return nil
}

func isUniqueConstraintErr(err error) bool {
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed")
}
