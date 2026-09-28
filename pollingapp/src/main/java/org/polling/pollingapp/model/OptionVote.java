package org.polling.pollingapp.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor		// JPA (Hibernate) requires a no-argument constructor to create the object when it pulls data from the database
@Embeddable			// This class does not have its own database table and no primary key, i.e., meant to be used as a field inside another entity
public class OptionVote {

	private String optText;
	private Long voteCount = 0L;

}
