package com.luvina.pos.provider.mapper;

import com.luvina.pos.provider.domain.transaction.primarykey.MachineStatusId;
import com.luvina.pos.provider.dto.app.MachineInfoDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MachineInfoMapper {
    MachineStatusId toMachineStatusId(MachineInfoDto machineInfoDto);
}
