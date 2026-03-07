package com.luvina.pos.provider.dto.app;

import lombok.Data;

@Data
public class PosInfoDto {
    private String companyCode;
    private String storeCode;
    private String instoreCode;

    public PosInfoDto(String company, String store, String instore) {
        companyCode = company;
        storeCode = store;
        instoreCode = instore;
    }
}
