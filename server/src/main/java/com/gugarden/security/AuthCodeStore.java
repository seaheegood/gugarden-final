package com.gugarden.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthCodeStore {

    private static final long CODE_TTL = 60_000L; // 60초

    private record CodeEntry(String jwt, long expiresAt) {}

    private final ConcurrentHashMap<String, CodeEntry> store = new ConcurrentHashMap<>();

    public String storeCode(String jwt) {
        String code = UUID.randomUUID().toString();
        store.put(code, new CodeEntry(jwt, System.currentTimeMillis() + CODE_TTL));
        return code;
    }

    public String exchangeCode(String code) {
        CodeEntry entry = store.remove(code);
        if (entry == null) {
            return null;
        }
        if (System.currentTimeMillis() > entry.expiresAt()) {
            return null;
        }
        return entry.jwt();
    }

    @Scheduled(fixedRate = 60000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        store.entrySet().removeIf(entry -> now > entry.getValue().expiresAt());
    }
}
