package com.luvina.pos.provider.exception.advide;

import lombok.Data;
import lombok.Getter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Getter
public class ErrorDetail {

    public ErrorDetail(String message) {
        this.id = UUID.randomUUID();
        this.message = message;
    }

    public ErrorDetail(String message, Map<String, List<String>> detailMap) {
        this.id = UUID.randomUUID();
        this.message = message;
        this.detailMap = detailMap;
    }

    private UUID id;
    private String message;
    private Map<String, List<String>> detailMap;
}
