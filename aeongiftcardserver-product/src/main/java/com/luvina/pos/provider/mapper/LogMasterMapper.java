package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.transaction.LogMaster;
import com.luvina.pos.provider.dto.app.LogInfoDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogMasterMapper {
    LogMaster toLogMaster(LogInfoDto logInfoDto);
}
