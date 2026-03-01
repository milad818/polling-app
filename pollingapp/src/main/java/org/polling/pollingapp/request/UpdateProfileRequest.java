package org.polling.pollingapp.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

	@Size(min = 3, max = 50)
	private String username;

	@Size(max = 255)
	private String bio;

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
}
