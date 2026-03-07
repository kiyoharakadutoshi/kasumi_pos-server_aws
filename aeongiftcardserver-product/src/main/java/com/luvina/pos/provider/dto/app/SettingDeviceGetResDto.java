package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettingDeviceGetResDto {
    private String companyCode;
    private String storeCode;
    private String instoreCode;
    private int deviceClass;
    private String employeeCode;
    private String employeeName;
    private String receiptNo;
    private String storeName;
    private String tel;
    private String codePayNoAeongift;
}
