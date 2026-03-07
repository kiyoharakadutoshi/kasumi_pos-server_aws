package com.luvina.pos.provider.mapper.keymapper;

import com.luvina.pos.provider.domain.transaction.primarykey.JournalId;
import com.luvina.pos.provider.dto.app.JournalDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JournalIdMapper {
    @Mapping(
            target = "recordDt",
            source = "recordDt",
            dateFormat = "yyyy/MM/dd HH:mm:ss"
    )
    JournalId toJournalId(JournalDto journalDto);
}
