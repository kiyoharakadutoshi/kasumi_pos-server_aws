package com.luvina.pos.provider.config.convert;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.internal.engine.path.PathImpl;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class QueryStringArgumentResolver implements HandlerMethodArgumentResolver {

    private final ObjectMapper mapper;

    private final Validator validator;

    @Override
    public boolean supportsParameter(final MethodParameter methodParameter) {
        return methodParameter.getParameterAnnotation(RequestMappingObject.class) != null;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {

        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        String queryString = request.getQueryString();
        Map<String, String> queryMap = parseQueryString(queryString);

        Object arg = mapper.convertValue(queryMap, parameter.getParameterType());
        boolean needValidation = false;
        for (var ann : parameter.getParameterAnnotations()) {
            if (ann.annotationType().equals(Valid.class)
                    || ann.annotationType().isAnnotationPresent(Validated.class)) {
                needValidation = true;
                break;
            }
        }

        if (needValidation) {
            var violations = validator.validate(arg);
            if (!violations.isEmpty()) {

                BindingResult bindingResult =
                        new BeanPropertyBindingResult(arg, parameter.getParameterName());

                for (ConstraintViolation<?> v : violations) {
                    String field = ((PathImpl) v.getPropertyPath()).getLeafNode().getName();

                    FieldError fieldError = new FieldError(
                            parameter.getContainingClass().getSimpleName(), // objectName
                            field,                                           // field
                            v.getMessage()                                  // message
                    );
                    bindingResult.addError(fieldError);
                }

                throw new MethodArgumentNotValidException(parameter, bindingResult);
            }
        }

        return arg;
    }

    private Map<String, String> parseQueryString(String qs) {
        Map<String, String> map = new LinkedHashMap<>();
        if (qs == null || qs.isEmpty()) {
            return map;
        }

        String[] pairs = qs.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf('=');
            String key = idx > 0 ? URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8) : pair;
            String value = idx > 0 && pair.length() > idx + 1
                    ? URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
                    : "";
            map.put(key, value);
        }

        return map;
    }
}
