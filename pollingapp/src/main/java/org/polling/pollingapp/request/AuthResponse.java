package org.polling.pollingapp.request;

import lombok.Data;

@Data
public class AuthResponse {

	private String token;
	private Long userId;
	private String username;
	private String email;

	public AuthResponse(String token, Long userId, String username, String email) {
		this.token = token;
		this.userId = userId;
		this.username = username;
		this.email = email;
	}
}
