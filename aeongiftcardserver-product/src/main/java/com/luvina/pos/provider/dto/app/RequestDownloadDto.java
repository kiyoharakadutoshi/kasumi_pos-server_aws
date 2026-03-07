package com.luvina.pos.provider.dto.app;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.luvina.pos.provider.constant.MessageConstant.MSG002V_STRING_PATH;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestDownloadDto {
    @NotBlank(message = MSG002V_STRING_PATH)
    private String stringPath;
}
