package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.transaction.ReceiptNoManager;
import com.luvina.pos.provider.dto.app.JournalDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiptNoMapper {
    @Mapping(
            target = "recordDt",
            source = "recordDt",
            dateFormat = "yyyy/MM/dd HH:mm:ss"
    )
    ReceiptNoManager toReceiptNoManager(JournalDto journalDto);
}
