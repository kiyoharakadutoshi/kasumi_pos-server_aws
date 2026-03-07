package com.luvina.pos.provider.validate;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static com.luvina.pos.provider.constant.CommonConstants.FORMAT_DATE_DEFAULT;
import static com.luvina.pos.provider.constant.MessageConstant.MSG008V;

@Constraint(validatedBy = NotFutureDateValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NotFutureDate {
    String format() default FORMAT_DATE_DEFAULT;

    int type() default 0; // 0: LocalDate, 1: LocalDateTime

    String message() default MSG008V;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
