# syntax=docker/dockerfile:1.4
FROM golang:1.25.3 AS builder

WORKDIR /app

# Копируем go.mod/go.sum
COPY backend/go.mod backend/go.sum ./backend/

WORKDIR /app/backend

# Скачиваем зависимости (теперь через HTTPS)
RUN go mod download

# Копируем исходники
COPY backend/. ./

# Сборка приложения
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/app ./cmd/app

# Минимальный образ
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/bin/app .
EXPOSE 8080
CMD ["./app"]
