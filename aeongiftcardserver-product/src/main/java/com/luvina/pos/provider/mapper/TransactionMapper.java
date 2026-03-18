package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.transaction.Transaction;
import com.luvina.pos.provider.dto.app.TransactionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction toTransaction(TransactionDto transactionDto);
}
