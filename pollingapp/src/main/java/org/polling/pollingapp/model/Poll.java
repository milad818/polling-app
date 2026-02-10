package org.polling.pollingapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity // Makes a class as a JPS (Tells Hibernate/JPA that this class maps to database table)
@Data   // Lombok Annotation - Auto-generates boilerplate code at compile time
@NoArgsConstructor  // Generates a no-argument constructor
public class Poll {
    @Id // Marks a field as the primary key - each entity must have one
    @GeneratedValue(strategy = GenerationType.IDENTITY) // The database generates the primary key value - assigns ID on insertion
    private Long id;
    private String question;

    @ElementCollection  // A collection of non-entity values that belong entirely to this entity.
    private List<OptionVote> options = new ArrayList<>();


}