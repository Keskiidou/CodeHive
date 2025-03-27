package model

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
	"time"
)

type Blog struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"type:varchar(255);not null" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	Author    string         `gorm:"type:varchar(100);not null" json:"author"`
	AuthorID  string         `gorm:"type:varchar(100);not null" json:"author_id"`
	Tags      pq.StringArray `gorm:"type:text[]" json:"tags"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
