package com.example.trietrack.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service component responsible for handling token revocation and logout management 
 * by checking and persisting invalid access token footprints in a Redis TTL cache layer.
 */
@Service
@RequiredArgsConstructor
public class RedisTokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    
    // Global namespace prefix to isolate token keys within our Redis cache instance
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    /**
     * Persists a revoked token into the Redis cache instance with an explicit TTL 
     * matching the token's remaining valid lifetime window.
     *
     * @param token           The raw compact string signature of the access token
     * @param remainingTimeMs The remaining validity window in milliseconds before natural expiry
     */
    public void blacklistToken(String token, long remainingTimeMs) {
        if (remainingTimeMs > 0) {
            String cacheKey = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(cacheKey, "revoked", remainingTimeMs, TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Checks if a user's current token footprint exists inside our Redis revocation store.
     *
     * @param token The raw compact string signature of the access token
     * @return true if the token footprint exists inside the cache; false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        String cacheKey = BLACKLIST_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey));
    }
}