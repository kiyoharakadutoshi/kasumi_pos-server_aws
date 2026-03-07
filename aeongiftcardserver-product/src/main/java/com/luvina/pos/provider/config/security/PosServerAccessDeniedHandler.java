package com.luvina.pos.provider.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luvina.pos.provider.exception.advide.ErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

import static com.luvina.pos.provider.constant.MessageConstant.MSG003E;

@Component
@RequiredArgsConstructor
public class PosServerAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    private final MessageSource messageSource;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpStatus.FORBIDDEN.value());
        String message;
        try {
            message = messageSource.getMessage(MSG003E, null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            message = e.getMessage();
        }
        ErrorDetail errorDetail = new ErrorDetail(message);
        response.getWriter().write(objectMapper.writeValueAsString(errorDetail));
    }

}
