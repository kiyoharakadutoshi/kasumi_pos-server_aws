package com.luvina.pos.provider.dto.app;

import lombok.Data;

@Data
public class LogInfoDto {
    private String companyCode;
    private String storeCode;
    private String instoreCode;
    private String ipAddress;
    private String url;
    private String headers;
    private String request;
    private Integer responseCode;
    private String response;
    private String macAddress;
    private Long recordTimestamp;
    private String transactionTime;
    private String environment;
}
