package auth

import (
	"hiyab-tutor/internal/config"
	"hiyab-tutor/internal/domain"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

const (
	RefreshTokenDuration = time.Hour * 24 * 3 // 3 days
	AccessTokenDuration  = time.Hour * 24     // 1 day
)

type UserClaims struct {
	jwt.RegisteredClaims
	UserID    uint   `json:"user_id"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	TokenType string `json:"token_type"`
}

const (
	TokenTypeRefresh = "refresh"
	TokenTypeAccess  = "access"
)

func GenerateToken(user *domain.Admin, tokenType string) (string, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return "", err
	}
	claims := UserClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
		UserID:    user.ID,
		Username:  user.Username,
		Role:      user.Role,
		TokenType: tokenType,
	}
	if tokenType == TokenTypeRefresh {
		claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(RefreshTokenDuration))
	} else if tokenType != TokenTypeAccess {
		return "", domain.ErrInvalidTokenType
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JwtSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ValidateToken(tokenString, tokenType string) (*UserClaims, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, err
	}
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JwtSecret), nil
	})
	userClaims, ok := token.Claims.(*UserClaims)
	if err != nil || !token.Valid || !ok {
		return nil, domain.ErrTokenInvalid
	}
	if userClaims.TokenType != tokenType {
		return nil, domain.ErrInvalidTokenType
	}
	if userClaims.ExpiresAt.Time.Before(time.Now()) {
		return nil, domain.ErrTokenExpired
	}
	return userClaims, nil
}
