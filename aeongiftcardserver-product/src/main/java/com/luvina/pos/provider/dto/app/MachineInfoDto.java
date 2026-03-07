package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import static com.luvina.pos.provider.constant.MessageConstant.*;

@Data
public class MachineInfoDto {
    @NotBlank(message = MSG002V_IP_ADDRESS)
    private String ipAddress;

    @NotBlank(message = MSG002V_MAC_ADDRESS)
    private String macAddress;
}
