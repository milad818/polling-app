package org.polling.pollingapp.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.repositories.UserRepository;
import org.polling.pollingapp.request.UpdateProfileRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setBio("Old bio");
        user.setAvatarUrl("https://example.com/old.png");
    }

    @Test
    void getUserById_existingUser_returnsUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.getUserById(1L);

        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updateProfile_updatesAllFields() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("newname");
        request.setBio("New bio");
        request.setAvatarUrl("https://example.com/new.png");

        when(userRepository.existsByUsername("newname")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.updateProfile(user, request);

        assertThat(user.getUsername()).isEqualTo("newname");
        assertThat(user.getBio()).isEqualTo("New bio");
        assertThat(user.getAvatarUrl()).isEqualTo("https://example.com/new.png");
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_sameUsername_doesNotThrow() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("testuser"); // same as current
        request.setBio("Updated bio");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.updateProfile(user, request);

        assertThat(user.getUsername()).isEqualTo("testuser");
        assertThat(user.getBio()).isEqualTo("Updated bio");
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_duplicateUsername_throwsException() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("taken");

        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateProfile(user, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username is already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_nullFields_keepsExistingValues() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        // All fields null — nothing should change

        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.updateProfile(user, request);

        assertThat(user.getUsername()).isEqualTo("testuser");
        assertThat(user.getBio()).isEqualTo("Old bio");
        assertThat(user.getAvatarUrl()).isEqualTo("https://example.com/old.png");
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_blankUsername_keepsExisting() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("   "); // blank
        request.setBio("New bio");

        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.updateProfile(user, request);

        assertThat(user.getUsername()).isEqualTo("testuser"); // unchanged
        assertThat(user.getBio()).isEqualTo("New bio");
        verify(userRepository).save(user);
    }
}
