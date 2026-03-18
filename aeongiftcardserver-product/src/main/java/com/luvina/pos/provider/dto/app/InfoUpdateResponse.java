package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InfoUpdateResponse {
    private Integer status;
    private String companyCode;
    private String storeCode;
    private String instoreCode;
    private String fileName;
}
