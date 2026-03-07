package com.luvina.pos.provider.dto.app;

import lombok.Data;

@Data
public class TransactionDto {
    private String currentOutputDatetime;
    private String journalData;
    private String journalJson;
    private String recordDt;
    private String receiptNo;
    private String receiptName;
    private String employeeCode;
    private Integer paymentAmount;
    private Integer previousAccountBalance;
    private Integer followingAccountBalance;
    private String giftCardCode;
    private Integer paymentType;
    private String approvalNumber;
}
