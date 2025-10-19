package routes

import (
	"net/http"
	"strings"

	"hiyab-tutor/internal/domain"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type totalsResponse struct {
	Bookings      int64 `json:"bookings"`
	Tutors        int64 `json:"tutors"`
	Partners      int64 `json:"partners"`
	Testimonials  int64 `json:"testimonials"`
	OtherServices int64 `json:"other_services"`
}

// SetupAnalyticsRoutes registers analytics endpoints
func SetupAnalyticsRoutes(r *gin.Engine, db *gorm.DB) {
	r.GET("/api/v1/analytics", func(c *gin.Context) {
		var bookings, tutors, partners, testimonials, services int64

		// Try the straightforward GORM model count first
		db.Model(&domain.Booking{}).Count(&bookings)
		db.Model(&domain.Tutor{}).Count(&tutors)
		db.Model(&domain.Partner{}).Count(&partners)
		db.Model(&domain.Testimonial{}).Count(&testimonials)
		db.Model(&domain.OtherService{}).Count(&services)

		// If some expected counts are zero, attempt a fallback by scanning
		// actual DB table names and counting rows from any table that looks
		// like the model (helps when tables were created/seeded with
		// non-standard names).
		if partners == 0 || testimonials == 0 || services == 0 {
			tables, _ := db.Migrator().GetTables()
			for _, t := range tables {
				// normalize to lower-case for substring matching
				tl := strings.ToLower(t)
				var cnt int64
				switch {
				case strings.Contains(tl, "partner"):
					db.Table(t).Count(&cnt)
					partners += cnt
				case strings.Contains(tl, "testimonial"):
					db.Table(t).Count(&cnt)
					testimonials += cnt
				case strings.Contains(tl, "other_service") || strings.Contains(tl, "otherservice") || strings.Contains(tl, "service"):
					db.Table(t).Count(&cnt)
					services += cnt
				case strings.Contains(tl, "booking"):
					db.Table(t).Count(&cnt)
					bookings += cnt
				case strings.Contains(tl, "tutor"):
					db.Table(t).Count(&cnt)
					tutors += cnt
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"totals": totalsResponse{
				Bookings:      bookings,
				Tutors:        tutors,
				Partners:      partners,
				Testimonials:  testimonials,
				OtherServices: services,
			},
		})
	})
}
