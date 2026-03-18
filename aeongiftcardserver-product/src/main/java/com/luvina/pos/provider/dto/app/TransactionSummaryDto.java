package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TransactionSummaryDto {
    private Long usageCount;
    private Long usageAmountTotal;
    private Long refundCount;
    private Long refundAmountTotal;
}
