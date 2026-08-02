package ch.railobserver.auth.dto;

public record SessionResponse(boolean authenticated, boolean authRequired) {
}
