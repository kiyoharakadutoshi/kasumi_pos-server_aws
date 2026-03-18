package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.luvina.pos.provider.constant.MessageConstant.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettingDeviceGetReqDto {

    @NotBlank(message = MSG002V_COMPANY_CODE)
    @Size(min = 1, max = 10, message = MSG001V_COMPANY_CODE)
    private String companyCode;

    @NotBlank(message = MSG002V_STORE_CODE)
    @Size(min = 1, max = 10, message = MSG001V_STORE_CODE)
    private String storeCode;

    @NotBlank(message = MSG002V_INSTORE_CODE)
    @Size(min = 1, max = 10, message = MSG001V_INSTORE_CODE)
    private String instoreCode;
}
