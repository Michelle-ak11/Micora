
package com.micora.backend.Email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Component
public class EmailService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient = RestClient.create();
    private final String apiKey;
    private final String from;

    public EmailService(@Value("${email.api-key:}") String apiKey,
                        @Value("${email.from:}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    public void send(String to, String subject, String htmlContent) {
        if (apiKey.isBlank() || from.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email is not configured");
        }

        Map<String, Object> body = Map.of(
            "sender", Map.of("name", "MICORA", "email", from),
            "to", List.of(Map.of("email", to)),
            "subject", subject,
            "htmlContent", htmlContent
        );

        try {
            restClient.post()
                .uri(BREVO_URL)
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not send email");
        }
    }
}