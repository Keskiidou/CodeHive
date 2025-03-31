package model

import (
	"gorm.io/gorm"
	"time"
)

type Response struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	BlogID    uint           `gorm:"not null;index" json:"blog_id"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	Author    string         `gorm:"type:varchar(100);not null" json:"author"`
	AuthorID  string         `gorm:"type:varchar(100);not null" json:"author_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Blog Blog `gorm:"foreignKey:BlogID;constraint:OnDelete:CASCADE" json:"-"`
}
