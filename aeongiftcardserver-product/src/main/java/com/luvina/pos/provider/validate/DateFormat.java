package com.luvina.pos.provider.validate;

import com.luvina.pos.provider.constant.CommonConstants;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static com.luvina.pos.provider.constant.MessageConstant.MSG009V;

@Constraint(validatedBy = DateFormatLogic.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DateFormat {
    String message() default MSG009V;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String pattern() default CommonConstants.FORMAT_DATE_DEFAULT;
}
