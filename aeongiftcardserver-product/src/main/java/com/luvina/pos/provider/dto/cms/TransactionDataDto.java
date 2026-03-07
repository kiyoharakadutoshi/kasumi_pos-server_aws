package com.luvina.pos.provider.dto.cms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDataDto {
    private LocalDateTime transactionDt;
    private String giftCardCode;
    private Integer amount;
    private Integer type;
    private String storeName;
    private String codePayNoAeongift;
    private String approvalNumber;
}
