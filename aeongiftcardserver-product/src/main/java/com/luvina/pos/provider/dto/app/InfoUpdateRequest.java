package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.luvina.pos.provider.constant.MessageConstant.MSG002V_APP_VERSION;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InfoUpdateRequest {
    @NotBlank(message = MSG002V_APP_VERSION)
    private String appVersion;
    private String osType;
    private String appId;
}
