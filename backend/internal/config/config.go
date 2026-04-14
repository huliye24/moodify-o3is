package config

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/viper"
)

// Config 应用配置
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	DeepSeek DeepSeekConfig
	Suno     SunoConfig
	Python   PythonConfig
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port string
	Mode string
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Type     string
	Path     string
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// DeepSeekConfig DeepSeek API 配置
type DeepSeekConfig struct {
	APIKey string
	Model  string
	URL    string
}

// SunoConfig Suno API 配置
type SunoConfig struct {
	APIKey  string
	BaseURL string
	Model   string
}

// PythonConfig Python 配置
type PythonConfig struct {
	Path     string
	ModelPath string
}

var AppConfig *Config

func LoadConfig() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("配置文件不存在，使用默认配置: %v", err)
	}

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "3001"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Type: getEnv("DB_TYPE", "sqlite"),
			Path: getEnv("DB_PATH", "./data/moodify.db"),
		},
		DeepSeek: DeepSeekConfig{
			APIKey: getEnv("DEEPSEEK_API_KEY", ""),
			Model:  getEnv("DEEPSEEK_MODEL", "deepseek-chat"),
			URL:    getEnv("DEEPSEEK_URL", "https://api.deepseek.com/v1/chat/completions"),
		},
		Suno: SunoConfig{
			APIKey:  getEnv("SUNO_API_KEY", ""),
			BaseURL: getEnv("SUNO_BASE_URL", "https://api.sunoai.com"),
			Model:   getEnv("SUNO_MODEL", "suno-3.5"),
		},
		Python: PythonConfig{
			Path:     getEnv("PYTHON_PATH", "python"),
			ModelPath: getEnv("BASICPITCH_MODEL", ""),
		},
	}

	return AppConfig
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (c *DatabaseConfig) DSN() string {
	if c.Type == "sqlite" {
		return c.Path
	}
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.DBName)
}
