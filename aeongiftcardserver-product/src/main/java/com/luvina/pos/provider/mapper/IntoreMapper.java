package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.master.primarykey.InstoreId;
import com.luvina.pos.provider.dto.app.AppUserDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface IntoreMapper {

    IntoreMapper INSTANCE = Mappers.getMapper(IntoreMapper.class);

    InstoreId toInstoreId(AppUserDto appUserDto);
}
