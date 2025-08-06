package middlewares

import (
	"hiyab-tutor/internal/auth"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Extract header from header
		header := ctx.GetHeader("Authorization")
		if header == "" {
			ctx.JSON(401, gin.H{"error": "Authorization token is required"})
			ctx.Abort()
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" {
			ctx.JSON(401, gin.H{"error": "Bearer token is required"})
			ctx.Abort()
			return
		}
		claims, err := auth.ValidateToken(token, auth.TokenTypeAccess)
		if err != nil {
			ctx.JSON(401, gin.H{"error": "Invalid or expired token"})
			ctx.Abort()
			return
		}
		ctx.Set("userID", claims.UserID)
		ctx.Set("username", claims.Username)
		ctx.Set("role", claims.Role)
		ctx.Next()
	}
}

func IsAdminMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role, exists := ctx.Get("role")
		if !exists || (role != "admin" && role != "superadmin") {
			ctx.JSON(403, gin.H{"error": "Admin access required"})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

func IsSuperAdminMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role, exists := ctx.Get("role")
		if !exists || role != "superadmin" {
			ctx.JSON(403, gin.H{"error": "Superadmin access required"})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}
