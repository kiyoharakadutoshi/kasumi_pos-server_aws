package com.luvina.pos.provider.exception.advide;

import com.luvina.pos.provider.exception.AuthException;
import com.luvina.pos.provider.exception.NotFoundException;
import com.luvina.pos.provider.util.ConvertUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.luvina.pos.provider.constant.MessageConstant.*;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class ApiExceptionHandler {

    private static final String TEMPLATE_MESSAGE_LOG_ERROR = "error_id{}: {}";
    private final MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetail> handleValidationExceptions(MethodArgumentNotValidException exception) {
        Map<String, List<String>> body = new HashMap<>();

        for (FieldError err : exception.getBindingResult().getFieldErrors()) {
            String key = ConvertUtils.camelToSnake(err.getField());
            if (body.containsKey(key)) {
                var errors = body.get(key);
                errors.add(err.getDefaultMessage());
            } else {
                List<String> errors = new ArrayList<>();
                errors.add(err.getDefaultMessage());
                body.put(key, errors);
            }
        }
        ErrorDetail errorDetail = new ErrorDetail(exception.getBindingResult().getFieldErrors().get(0).getDefaultMessage(), body);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(errorDetail);
    }

    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErrorDetail> handlingRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException exception) {
        String msgErrorDefault = getMessageError(MSG005E);
        ErrorDetail errorDetail = new ErrorDetail(msgErrorDefault);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), msgErrorDefault, exception);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(errorDetail);
    }


    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ErrorDetail> handlingRuntimeException(Exception exception) {
        ErrorDetail errorDetail = new ErrorDetail(exception.getMessage());
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorDetail);
    }

    @ExceptionHandler(value = IllegalArgumentException.class)
    ResponseEntity<ErrorDetail> handlingRuntimeIllegalArgumentException(IllegalArgumentException exception) {
        String msgErrorDefault = getMessageError(MSG008E);
        ErrorDetail errorDetail = new ErrorDetail(msgErrorDefault);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), msgErrorDefault, exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorDetail);
    }

    @ExceptionHandler(value = AuthException.class)
    public ResponseEntity<ErrorDetail> todoAuthException(AuthException exception) {
        String msgErrorDefault = getMessageError(MSG004E);
        ErrorDetail errorDetail = new ErrorDetail(msgErrorDefault);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), msgErrorDefault, exception);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(errorDetail);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorDetail> todoNotFoundException(NotFoundException exception) {
        String rawMessageOrKey = exception.getMessage();
        String resolvedMessage;

        try {
            resolvedMessage = messageSource.getMessage(
                    rawMessageOrKey,
                    exception.getArgs(),
                    LocaleContextHolder.getLocale()
            );
        } catch (NoSuchMessageException e) {
            resolvedMessage = rawMessageOrKey;
        }
        ErrorDetail errorDetail = new ErrorDetail(resolvedMessage);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(errorDetail);
    }

    @ExceptionHandler(value = {AccessDeniedException.class, AuthorizationDeniedException.class})
    ResponseEntity<ErrorDetail> handlingAccessDeniedException(AccessDeniedException exception) {
        String msgErrorDefault = getMessageError(MSG003E);
        ErrorDetail errorDetail = new ErrorDetail(msgErrorDefault);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), msgErrorDefault, exception);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDetail);
    }

    @ExceptionHandler(value = MethodArgumentTypeMismatchException.class)
    ResponseEntity<ErrorDetail> handlingBadRequestException(MethodArgumentTypeMismatchException exception) {
        ErrorDetail errorDetail = new ErrorDetail(exception.getMessage());
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetail);
    }

    @ExceptionHandler(value = HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ErrorDetail> handlingMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException exception) {
        String msgErrorDefault = getMessageError(MSG007E);
        ErrorDetail errorDetail = new ErrorDetail(msgErrorDefault);
        log.error(TEMPLATE_MESSAGE_LOG_ERROR, errorDetail.getId(), msgErrorDefault, exception);
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(errorDetail);
    }

    private String getMessageError(String msg) {
        String resolvedMessage;
        try {
            resolvedMessage = messageSource.getMessage(
                    msg,
                    null,
                    LocaleContextHolder.getLocale()
            );
        } catch (NoSuchMessageException e) {
            resolvedMessage = null;
        }
        return resolvedMessage;
    }
}