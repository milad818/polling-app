package org.polling.pollingapp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

// Unit tests for JwtUtil - no Spring context needed
class JwtUtilTest {

    private JwtUtil jwtUtil;

    // A test secret key (must be at least 32 characters for HS256)
    private static final String TEST_SECRET = "testSecretKeyThatIsAtLeast32Characters!!";
    private static final long EXPIRATION_MS = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_shouldReturnNonNullToken() {
        String token = jwtUtil.generateToken(1L, "test@example.com");

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
    }

    @Test
    void getUserIdFromToken_shouldReturnCorrectUserId() {
        Long userId = 42L;
        String token = jwtUtil.generateToken(userId, "test@example.com");

        Long extractedUserId = jwtUtil.getUserIdFromToken(token);

        assertThat(extractedUserId).isEqualTo(userId);
    }

    @Test
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtUtil.generateToken(1L, "test@example.com");

        boolean isValid = jwtUtil.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void validateToken_shouldReturnFalseForTamperedToken() {
        String token = jwtUtil.generateToken(1L, "test@example.com");
        String tamperedToken = token + "tampered";

        boolean isValid = jwtUtil.validateToken(tamperedToken);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForGarbageString() {
        boolean isValid = jwtUtil.validateToken("not.a.real.token");

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForExpiredToken() {
        // Create a JwtUtil with 0ms expiration so the token is immediately expired
        JwtUtil expiredJwtUtil = new JwtUtil(TEST_SECRET, 0);
        String token = expiredJwtUtil.generateToken(1L, "test@example.com");

        boolean isValid = expiredJwtUtil.validateToken(token);

        assertThat(isValid).isFalse();
    }

    @Test
    void validateToken_shouldReturnFalseForTokenSignedWithDifferentKey() {
        JwtUtil otherJwtUtil = new JwtUtil("aCompletelyDifferentSecretKeyThat32Ch!", EXPIRATION_MS);
        String tokenFromOtherKey = otherJwtUtil.generateToken(1L, "test@example.com");

        boolean isValid = jwtUtil.validateToken(tokenFromOtherKey);

        assertThat(isValid).isFalse();
    }
}
