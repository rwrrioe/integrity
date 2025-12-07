# syntax=docker/dockerfile:1.4
FROM golang:1.25.3 AS builder

ENV GOPRIVATE=github.com/rwrrioe/*

WORKDIR /app

# SSH setup
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts

# Чтобы go mod использовал SSH вместо HTTPS
RUN git config --global url."git@github.com:".insteadOf "https://github.com/"

# Копируем go.mod/go.sum
COPY backend/go.mod backend/go.sum ./

WORKDIR /app/backend

# Скачиваем зависимости через SSH
RUN --mount=type=ssh go mod download

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
