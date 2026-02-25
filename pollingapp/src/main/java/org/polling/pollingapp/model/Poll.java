package org.polling.pollingapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity // Makes a class as a JPS (Tells Hibernate/JPA that this class maps to database
		// table)
@Data // Lombok Annotation - Auto-generates boilerplate code at compile time
@NoArgsConstructor // Generates a no-argument constructor
public class Poll {
	@Id // Marks a field as the primary key - each entity must have one
	@GeneratedValue(strategy = GenerationType.IDENTITY) // The database generates the primary key value - assigns ID on
														// insertion
	private Long id;
	private String question;

	@ElementCollection // A collection of non-entity values that belong entirely to this entity.
	private List<OptionVote> options = new ArrayList<>();

	// The user who created this poll
	// @ManyToOne by itself is enough to trigger the tables, even if there are other
	// types/tables involved
	// JoinColumn() is used to specify a custom name, otherwise JPA auto-generates
	// column name
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "owner_id")
	@JsonIgnoreProperties({"passwordHash", "bio", "avatarUrl", "createdAt"})
	private User owner;

	private LocalDateTime createdAt = LocalDateTime.now();
}
