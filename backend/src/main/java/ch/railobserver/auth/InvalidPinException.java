package ch.railobserver.auth;

public class InvalidPinException extends RuntimeException {

    public InvalidPinException() {
        super("Invalid PIN");
    }
}
