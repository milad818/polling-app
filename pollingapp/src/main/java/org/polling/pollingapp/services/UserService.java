package org.polling.pollingapp.services;

import org.polling.pollingapp.model.User;
import org.polling.pollingapp.repositories.UserRepository;
import org.polling.pollingapp.request.UpdateProfileRequest;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // Update profile - only allows updating username, bio, and avatar
    public User updateProfile(User currentUser, UpdateProfileRequest request) {
        // Make sure the new username is not assigned a null value nor blank (whitespace).
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            // Check if the new username is already taken by another user
            if (userRepository.existsByUsername(request.getUsername())
                    && !currentUser.getUsername().equals(request.getUsername())) {
                throw new RuntimeException("Username is already taken!");
            }
            currentUser.setUsername(request.getUsername());
        }

        if (request.getBio() != null) {
            currentUser.setBio(request.getBio());
        }

        if (request.getAvatarUrl() != null) {
            currentUser.setAvatarUrl(request.getAvatarUrl());
        }

        return userRepository.save(currentUser);
    }
}
