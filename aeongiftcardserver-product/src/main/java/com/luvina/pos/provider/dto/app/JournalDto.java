package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class JournalDto {
    private Integer companyCode;
    private Integer storeCode;
    private String instoreCode;
    private String recordDt;
    private String prcno;
    private String prcname;
    private String accountId;
    private String jrndata;
    private String jrndataJson;
    private Short type;
    private String amount;
}
