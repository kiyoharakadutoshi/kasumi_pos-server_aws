package com.luvina.pos.provider.dto.app;

import lombok.Data;

@Data
public class ResCheckSettlement {
    private String companyCode;
    private String storeCode;
    private String instoreCode;
    private String previousOutputDatetime;
    private String currentOutputDatetime;
    private Long usageCount;
    private Long usageAmountTotal;
    private Long refundCount;
    private Long refundAmountTotal;
}
