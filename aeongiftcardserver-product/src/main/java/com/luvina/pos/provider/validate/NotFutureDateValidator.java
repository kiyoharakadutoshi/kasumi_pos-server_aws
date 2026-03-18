package com.luvina.pos.provider.validate;

import com.luvina.pos.provider.util.ConvertUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class NotFutureDateValidator implements ConstraintValidator<NotFutureDate, String> {

    private String format;

    private int type;

    @Override
    public void initialize(NotFutureDate constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        format = constraintAnnotation.format();
        type = constraintAnnotation.type();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext constraintValidatorContext) {
        if (StringUtils.isEmpty(value)) {
            return true;
        }
        return type == 0 ? isFutureDate(value) : isFutureDateTime(value);
    }

    /**
     * Is Future Date
     *
     * @param value String
     * @return is Future Date
     */
    private boolean isFutureDate(String value) {
        try {
            LocalDate date = ConvertUtils.convertStringToDate(value, format);
            return !date.isAfter(LocalDate.now());
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    /**
     * Is Future Date
     *
     * @param value String
     * @return is Future Date
     */
    private boolean isFutureDateTime(String value) {
        try {
            LocalDateTime date = ConvertUtils.convertStringToLocalDateTime(value, format);
            return !date.isAfter(LocalDateTime.now());
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

}
