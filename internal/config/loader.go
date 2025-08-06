package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	JwtSecret     string `mapstructure:"JWT_SECRET"`
	ServerPort    string `mapstructure:"SERVER_PORT"`
	AdminUsername string `mapstructure:"ADMIN_USERNAME"`
	AdminPassword string `mapstructure:"ADMIN_PASSWORD"`
	WebAppUrl     string `mapstructure:"WEB_APP_URL"`
	DBUrl         string `mapstructure:"BLUEPRINT_DB_URL"`
	DBUsername    string `mapstructure:"BLUEPRINT_DB_USERNAME"`
	DBPassword    string `mapstructure:"BLUEPRINT_DB_PASSWORD"`
	DBName        string `mapstructure:"BLUEPRINT_DB_DATABASE"`
	DBHost        string `mapstructure:"BLUEPRINT_DB_HOST"`
	DBPort        string `mapstructure:"BLUEPRINT_DB_PORT"`
	Schema        string `mapstructure:"BLUEPRINT_DB_SCHEMA"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AutomaticEnv() // Allow environment variables to override
	err := viper.ReadInConfig()
	if err != nil {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".") // Look in the current directory for config.yaml
		err = viper.ReadInConfig()
		if err != nil {
			return nil, err
		}
	}

	var c Config
	if err := viper.Unmarshal(&c); err != nil {
		return nil, err
	}
	return &c, nil
}
