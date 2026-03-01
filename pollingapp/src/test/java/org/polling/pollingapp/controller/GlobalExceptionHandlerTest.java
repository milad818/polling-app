package org.polling.pollingapp.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

// Pure unit tests for GlobalExceptionHandler — no Spring context needed
class GlobalExceptionHandlerTest {

	private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

	// ── RuntimeException routing ───────────────────────────────────────

	@Test
	void handleRuntimeException_returns409_whenEmailAlreadyRegistered() {
		RuntimeException ex = new RuntimeException("Email is already registered!");

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
		assertThat(response.getBody()).containsEntry("message", "Email is already registered!");
	}

	@Test
	void handleRuntimeException_returns409_whenUsernameAlreadyTaken() {
		RuntimeException ex = new RuntimeException("Username is already taken!");

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void handleRuntimeException_returns401_whenUserNotFound() {
		RuntimeException ex = new RuntimeException("User not found!");

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void handleRuntimeException_returns401_whenInvalidCredentials() {
		RuntimeException ex = new RuntimeException("Invalid email or password!");

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void handleRuntimeException_returns400_forGenericError() {
		RuntimeException ex = new RuntimeException("Something unexpected happened");

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void handleRuntimeException_returns400_whenMessageIsNull() {
		RuntimeException ex = new RuntimeException((String) null);

		ResponseEntity<Map<String, String>> response = handler.handleRuntimeException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody()).containsKey("message");
	}

	// ── MethodArgumentNotValidException ───────────────────────────────

	@Test
	void handleValidationException_returns400_withSingleFieldError() {
		FieldError fieldError = new FieldError("req", "username", "size must be between 3 and 50");
		BindingResult bindingResult = mock(BindingResult.class);
		when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

		MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
		when(ex.getBindingResult()).thenReturn(bindingResult);

		ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().get("message")).contains("username");
		assertThat(response.getBody().get("message")).contains("size must be between 3 and 50");
	}

	@Test
	void handleValidationException_returns400_withMultipleFieldErrors() {
		FieldError e1 = new FieldError("req", "username", "too short");
		FieldError e2 = new FieldError("req", "bio", "too long");
		BindingResult bindingResult = mock(BindingResult.class);
		when(bindingResult.getFieldErrors()).thenReturn(List.of(e1, e2));

		MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
		when(ex.getBindingResult()).thenReturn(bindingResult);

		ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().get("message")).contains("username").contains("bio");
	}

	@Test
	void handleValidationException_returns400_withFallbackMessage_whenNoFieldErrors() {
		BindingResult bindingResult = mock(BindingResult.class);
		when(bindingResult.getFieldErrors()).thenReturn(List.of());

		MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
		when(ex.getBindingResult()).thenReturn(bindingResult);

		ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().get("message")).isEqualTo("Validation failed");
	}
}
