package com.luvina.pos.provider.exception;

public class FtpConnectionException extends Exception {
    /**
     * Serial number
     */
    private static final long serialVersionUID = 1L;

    public FtpConnectionException(String message) {
        super(message);
    }

    public FtpConnectionException(Exception e) {
        super(e);
    }
}
