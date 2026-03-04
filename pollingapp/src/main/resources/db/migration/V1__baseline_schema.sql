-- Baseline schema matching JPA entities: User, Poll, OptionVote, VoteRecord

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    bio             VARCHAR(255),
    avatar_url      LONGTEXT,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    display_name    VARCHAR(100),
    location        VARCHAR(100),
    website         VARCHAR(255),
    gender          VARCHAR(20),
    date_of_birth   VARCHAR(255),
    created_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poll (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    question        VARCHAR(255),
    owner_id        BIGINT,
    created_at      DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_poll_owner FOREIGN KEY (owner_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS poll_options (
    poll_id         BIGINT          NOT NULL,
    opt_text        VARCHAR(255),
    vote_count      BIGINT,
    CONSTRAINT fk_poll_options_poll FOREIGN KEY (poll_id) REFERENCES poll (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS votes (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    poll_id         BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    option_index    INT,
    voted_at        DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_votes_poll_user (poll_id, user_id),
    CONSTRAINT fk_votes_poll FOREIGN KEY (poll_id) REFERENCES poll (id),
    CONSTRAINT fk_votes_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
