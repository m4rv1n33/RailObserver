package ch.railobserver.meta.dto;

// Null rather than an empty string when unconfigured, so the client can tell
// "not set" from "set to nothing" and hide the line entirely.
public record MetaResponse(String serverName, String environment) {
}
