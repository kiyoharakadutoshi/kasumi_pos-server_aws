package com.luvina.pos.provider.service;

import com.luvina.pos.provider.domain.transaction.MachineStatusHistory;
import com.luvina.pos.provider.domain.transaction.primarykey.MachineStatusId;
import com.luvina.pos.provider.dto.app.MachineInfoDto;
import com.luvina.pos.provider.mapper.MachineInfoMapper;
import com.luvina.pos.provider.repository.transaction.HealthCheckRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Transactional(value = "masterTransactionManager", rollbackFor = Exception.class)
public class HealthCheckService {

    private final HealthCheckRepository healthCheckRepository;

    private final MachineInfoMapper machineInfoMapper;

    public Long healthCheck(MachineInfoDto machineInfoDto) {
        MachineStatusId id = machineInfoMapper.toMachineStatusId(machineInfoDto);
        var saveTimeSV = LocalDateTime.now();
        long millis = saveTimeSV.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
        MachineStatusHistory machineStatusHistory = new MachineStatusHistory(id, saveTimeSV);
        healthCheckRepository.save(machineStatusHistory);
        return millis;
    }
}
