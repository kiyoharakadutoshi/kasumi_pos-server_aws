package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import static com.luvina.pos.provider.constant.MessageConstant.*;

@Data
public class AppUserDto {

    @NotBlank(message = MSG002V_STORE_CODE)
    @Size(max = 10, message = MSG001V_COMPANY_CODE)
    private String companyCode;

    @NotBlank(message = MSG002V_COMPANY_CODE)
    @Size(max = 10, message = MSG001V_STORE_CODE)
    private String storeCode;

    @NotBlank(message = MSG002V_INSTORE_CODE)
    @Size(max = 10, message = MSG001V_INSTORE_CODE)
    private String instoreCode;

    @NotBlank(message = MSG002V_OS_TYPE)
    @Size(max = 50, message = MSG001V_OS_TYPE)
    private String osType;

    @NotBlank(message = MSG002V_OS_VERSION)
    @Size(max = 50, message = MSG001V_OS_VERSION)
    private String osVersion;

    @NotBlank(message = MSG002V_APP_VERSION)
    @Size(max = 50, message = MSG001V_APP_VERSION)
    private String appVersion;

}
