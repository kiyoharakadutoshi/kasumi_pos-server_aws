package com.luvina.pos.provider.exception;

public class FtpSendFileException extends Exception {
    /**
     * Serial number
     */
    private static final long serialVersionUID = 1L;

    public FtpSendFileException(String message) {
        super(message);
    }

    public FtpSendFileException(Exception e) {
        super(e);
    }
}
