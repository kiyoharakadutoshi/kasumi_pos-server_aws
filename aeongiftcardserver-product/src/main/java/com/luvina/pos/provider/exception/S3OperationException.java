package com.luvina.pos.provider.exception;

import com.luvina.pos.provider.constant.CommonConstants;
import lombok.Getter;

@Getter
public class S3OperationException extends RuntimeException {
    private final CommonConstants.OperationType type;

    public S3OperationException(CommonConstants.OperationType type, String message, Throwable cause) {
        super(message, cause);
        this.type = type;
    }

}

