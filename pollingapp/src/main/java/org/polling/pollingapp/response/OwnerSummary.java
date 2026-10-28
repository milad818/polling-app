package org.polling.pollingapp.response;

import org.polling.pollingapp.model.User;

// Public view of a poll owner; deliberately omits contact and account fields
public record OwnerSummary(Long id, String username) {

	public static OwnerSummary from(User user) {
		return user == null ? null : new OwnerSummary(user.getId(), user.getUsername());
	}
}
