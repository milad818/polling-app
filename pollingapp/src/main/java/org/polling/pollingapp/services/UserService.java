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
		return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found!"));
	}

	// Update profile fields — only non-null, non-blank values are applied.
	public User updateProfile(User currentUser, UpdateProfileRequest request) {
		if (hasText(request.getUsername())) {
			if (userRepository.existsByUsername(request.getUsername())
					&& !currentUser.getUsername().equals(request.getUsername())) {
				throw new RuntimeException("Username is already taken!");
			}
			currentUser.setUsername(request.getUsername());
		}

		if (request.getBio() != null) {
			currentUser.setBio(request.getBio().isBlank() ? null : request.getBio());
		}

		if (hasText(request.getAvatarUrl())) {
			currentUser.setAvatarUrl(request.getAvatarUrl());
		}

		if (hasText(request.getFirstName())) {
			currentUser.setFirstName(request.getFirstName());
		}

		if (hasText(request.getLastName())) {
			currentUser.setLastName(request.getLastName());
		}

		if (hasText(request.getDisplayName())) {
			currentUser.setDisplayName(request.getDisplayName());
		}

		if (hasText(request.getLocation())) {
			currentUser.setLocation(request.getLocation());
		}

		if (hasText(request.getWebsite())) {
			currentUser.setWebsite(request.getWebsite());
		}

		if (hasText(request.getGender())) {
			currentUser.setGender(request.getGender());
		}

		if (hasText(request.getDateOfBirth())) {
			currentUser.setDateOfBirth(request.getDateOfBirth());
		}

		return userRepository.save(currentUser);
	}

	/**
	 * Returns true if the string is non-null and contains at least one
	 * non-whitespace character.
	 */
	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
