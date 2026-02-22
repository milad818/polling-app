package org.polling.pollingapp.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.repositories.UserRepository;
import org.polling.pollingapp.request.AuthResponse;
import org.polling.pollingapp.request.LoginRequest;
import org.polling.pollingapp.request.RegisterRequest;
import org.polling.pollingapp.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// Unit tests for AuthService - mocks all dependencies
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password1!x");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("Password1!x");
    }

    // --- Register Tests ---

    @Test
    void register_shouldReturnAuthResponse_whenValidRequest() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername("test")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("test");
        savedUser.setEmail("test@example.com");
        savedUser.setPasswordHash("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtUtil.generateToken(1L, "test@example.com")).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("test");
        assertThat(response.getEmail()).isEqualTo("test@example.com");

        // Verify password was encoded, not stored in plain text
        verify(passwordEncoder).encode("Password1!x");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrowException_whenEmailAlreadyExists() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email is already registered!");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_shouldAppendSuffix_whenUsernameAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        // "test" is taken, "test1" is free
        when(userRepository.existsByUsername("test")).thenReturn(true);
        when(userRepository.existsByUsername("test1")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setUsername("test1");
        savedUser.setEmail("test@example.com");
        savedUser.setPasswordHash("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtUtil.generateToken(2L, "test@example.com")).thenReturn("jwt-token-2");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getUsername()).isEqualTo("test1");
        verify(userRepository).save(any(User.class));
    }

    // --- Login Tests ---

    @Test
    void login_shouldReturnAuthResponse_whenCredentialsAreValid() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1!x", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "test@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("testuser");
    }

    @Test
    void login_shouldThrowException_whenEmailNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid email or password!");
    }

    @Test
    void login_shouldThrowException_whenPasswordIsWrong() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1!x", "hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid email or password!");
    }
}
