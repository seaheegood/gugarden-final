package com.gugarden.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // userId → 무효화 시각 (epoch millis)
    private final ConcurrentHashMap<Integer, Long> blacklist = new ConcurrentHashMap<>();

    public void invalidateUser(Integer userId) {
        blacklist.put(userId, System.currentTimeMillis());
    }

    public boolean isBlacklisted(Integer userId, long tokenIssuedAtMillis) {
        Long invalidatedAt = blacklist.get(userId);
        if (invalidatedAt == null) {
            return false;
        }
        return tokenIssuedAtMillis < invalidatedAt;
    }

    @Scheduled(fixedRate = 3600000) // 1시간마다
    public void cleanup() {
        long sevenDaysAgo = System.currentTimeMillis() - 604_800_000L;
        blacklist.entrySet().removeIf(entry -> entry.getValue() < sevenDaysAgo);
    }
}
