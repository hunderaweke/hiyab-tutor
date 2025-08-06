package config

import (
	"github.com/spf13/viper"
)

type Admin struct {
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

type Config struct {
	Jwt       Jwt      `mapstructure:"jwt"`
	Database  Database `mapstructure:"database"`
	Server    Server   `mapstructure:"server"`
	BotToken  string   `mapstructure:"bot_token"`
	Admin     Admin    `mapstructure:"admin"`
	WebAppUrl string   `mapstructure:"web_app_url"`
}

type Jwt struct {
	Secret string `mapstructure:"secret"`
}

type Database struct {
	Url      string `mapstructure:"url"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
	Name     string `mapstructure:"name"`
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
}

type Server struct {
	Port string `mapstructure:"port"`
	Url  string `mapstructure:"url"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	err := viper.ReadInConfig()
	if err != nil {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".") // Look in the current directory for config.yaml
		viper.AutomaticEnv()     // Allow environment variables to override
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
