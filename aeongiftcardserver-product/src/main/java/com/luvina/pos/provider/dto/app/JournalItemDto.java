package com.luvina.pos.provider.dto.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalItemDto {

    private Integer transactionType;

    private String companyName;

    private String transactionDate;

    private String storeCode;

    private String storeName;

    private String storeTel;

    private String storeFax;

    private String instoreCode;

    private String receiptNo;

    private String journalData;

    private String employeeName;

    private String employeeCode;

    private String amount;

    private String receiptName;
}

