package com.luvina.pos.provider.exception;

public class AuthException extends RuntimeException {

    private static final long serialVersionUID = -2634379978579601027L;

    public AuthException() {
        super();
    }

    public AuthException(String message) {
        super(message);
    }

}
