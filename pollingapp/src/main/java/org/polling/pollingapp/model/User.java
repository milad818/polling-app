package org.polling.pollingapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users") // "user" is a reserved keyword in MySQL
@Data
@NoArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(min = 3, max = 50)
	@Column(unique = true, nullable = false)
	private String username;

	@NotBlank
	@Email
	@Column(unique = true, nullable = false)
	private String email;

	@NotBlank
	@Column(nullable = false)
	private String passwordHash;

	@Size(max = 255)
	private String bio;

	@Lob
	@Column(columnDefinition = "LONGTEXT")
	private String avatarUrl;

	@Size(max = 50)
	private String firstName;

	@Size(max = 50)
	private String lastName;

	@Size(max = 100)
	private String displayName;

	@Size(max = 100)
	private String location;

	@Size(max = 255)
	private String website;

	@Size(max = 20)
	private String gender;

	private String dateOfBirth;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();
}
