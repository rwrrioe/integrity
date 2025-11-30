package storage

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisStorage struct {
	ttl    time.Duration
	сlient *redis.Client
}

func NewRedisStorage(addr string, ttl time.Duration) *RedisStorage {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
	})

	return &RedisStorage{
		ttl:    ttl,
		сlient: rdb,
	}
}

func (s *RedisStorage) Get(ctx context.Context, key string) (string, error) {
	val, err := s.сlient.Get(ctx, key).Result()
	if err != nil {
		return "", err
	}

	return val, nil
}

func (s *RedisStorage) Set(ctx context.Context, key string, value interface{}) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	err = s.сlient.Set(ctx, key, b, s.ttl).Err()
	if err != nil {
		return err
	}

	return nil
}
