package org.polling.pollingapp.controller;

import jakarta.validation.Valid;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.request.UpdateProfileRequest;
import org.polling.pollingapp.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200/")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get the currently authenticated user's profile
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(buildUserResponse(currentUser));
    }

    // Get any user's public profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(buildUserResponse(user));
    }

    // Update the currently authenticated user's profile
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        User updatedUser = userService.updateProfile(currentUser, request);
        return ResponseEntity.ok(buildUserResponse(updatedUser));
    }

    // Build a safe response that excludes sensitive fields like passwordHash
    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("bio", user.getBio());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("createdAt", user.getCreatedAt());
        return response;
    }
}
