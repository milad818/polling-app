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
}
