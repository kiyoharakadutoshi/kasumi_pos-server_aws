package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.transaction.Journal;
import com.luvina.pos.provider.dto.app.TransactionDto;
import com.luvina.pos.provider.dto.app.JournalDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JournalMapper {
    Journal toJournal(TransactionDto transactionDto);

    Journal toJournal(JournalDto journalDto);
}