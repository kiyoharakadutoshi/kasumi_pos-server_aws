package com.luvina.pos.provider.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class ConvertUtils {

    private ConvertUtils() {
    }

    public static String padZero(int value, int length) {
        return String.format("%0" + length + "d", value);
    }

    public static String lastChars(String str, Integer length) {
        if (str == null || str.length() <= length) {
            return str;
        }
        return str.substring(str.length() - length);
    }

    public static String limitToChars(String input, Integer limit) {
        if (input == null) return null;
        return input.length() <= limit ? input : input.substring(0, limit);
    }

    /**
     * Convert camelCase to snake_case
     *
     * @param str String
     * @return snake_case
     */
    public static String camelToSnake(String str) {
        // Use regex to find positions where a lowercase letter is followed by an
        // uppercase letter
        // and insert an underscore
        String snakeCase = str.replaceAll("([a-z0-9])([A-Z])", "$1_$2").replaceAll("([A-Z]+)([A-Z][a-z])", "$1_$2");
        // Convert the entire string to lowercase
        return snakeCase.toLowerCase();
    }

    public static LocalDate convertStringToDate(String date, String format) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
        try {
            return LocalDate.parse(date, formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format: " + date);
        }
    }

    public static String convertLocalDateTimeToString(LocalDateTime value, String formatTime) {
        try {
            if (value == null) {
                return null;
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(formatTime);
            return value.format(formatter);
        } catch (Exception e) {
            return null;
        }
    }

    public static LocalDateTime convertStringToLocalDateTime(String value, String formatTime) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(formatTime);
            return LocalDateTime.parse(value, formatter);
        } catch (Exception e) {
            return null;
        }
    }

    public static LocalDateTime toLocalDateTime(Long millis) {
        try {
            return millis == null ? null :
                    Instant.ofEpochMilli(millis)
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
        } catch (Exception e) {
            return null;
        }
    }


}
