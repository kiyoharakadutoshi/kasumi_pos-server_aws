package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogChunkDto {
    private String name;
    private String fileName;
    private String macAddress;
    private String ipAddress;
    private String data;
    private String companyCode;
    private String storeCode;
    private String instoreCode;
}
