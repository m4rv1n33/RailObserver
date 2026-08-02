package ch.railobserver.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String pin) {
}
