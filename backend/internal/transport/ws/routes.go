package ws

import (
	"github.com/gin-gonic/gin"
	ws_handlers "github.com/rwrrioe/integrity/backend/internal/transport/ws/handlers"
	hub "github.com/rwrrioe/integrity/backend/internal/transport/ws/ws_hub"
)

type Handlers struct {
	Ws *ws_handlers.Handler
}

func New(ws *hub.WebSocketHub) *Handlers {
	h := ws_handlers.NewHandler(ws)

	return &Handlers{
		Ws: h,
	}
}

func RegisterRoutes(r *gin.Engine, handlers *Handlers) {
	r.GET("/ws", handlers.Ws.WebSocket)
}
