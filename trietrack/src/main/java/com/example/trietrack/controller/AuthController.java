package com.example.trietrack.controller;

import java.util.Date;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

import com.example.trietrack.dto.LoginRequest;
import com.example.trietrack.dto.RegisterRequest;
import com.example.trietrack.security.AuthService;
import com.example.trietrack.security.JWTUtils;
import com.example.trietrack.security.RedisTokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JWTUtils jwtUtils;
    private final RedisTokenBlacklistService blacklistService;

    @PostMapping("/register") 
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String token = authService.register(request);
        return ResponseEntity.ok(Map.of("token", token, "message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of("token", token, "message", "Login successful!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String jwt = headerAuth.substring(7);

            Date expiration = jwtUtils.extractExpiration(jwt);
            long remainingTimeMs = expiration.getTime() - System.currentTimeMillis();

            blacklistService.blacklistToken(jwt, remainingTimeMs);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully! Token invalidated."));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "No bearer token provided."));
    }
}
