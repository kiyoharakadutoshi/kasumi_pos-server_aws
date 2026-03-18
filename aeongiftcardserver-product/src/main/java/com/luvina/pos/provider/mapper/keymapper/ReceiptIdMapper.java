package com.luvina.pos.provider.mapper.keymapper;

import com.luvina.pos.provider.domain.transaction.primarykey.ReceiptNoId;
import com.luvina.pos.provider.dto.app.JournalDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReceiptIdMapper {
    ReceiptNoId toReceiptNoId(JournalDto journalDto);
}
