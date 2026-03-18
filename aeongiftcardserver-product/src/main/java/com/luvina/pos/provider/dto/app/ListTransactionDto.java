package com.luvina.pos.provider.dto.app;

import lombok.Data;

import java.util.List;

@Data
public class ListTransactionDto {
    private List<TransactionDto> items;
}
