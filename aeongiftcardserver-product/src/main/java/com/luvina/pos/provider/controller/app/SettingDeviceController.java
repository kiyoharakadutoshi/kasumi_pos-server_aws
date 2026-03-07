package com.luvina.pos.provider.controller.app;

import com.luvina.pos.provider.config.convert.RequestMappingObject;
import com.luvina.pos.provider.dto.app.SettingDeviceGetReqDto;
import com.luvina.pos.provider.dto.base.BaseResponse;
import com.luvina.pos.provider.service.SettingDeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/app")
public class SettingDeviceController {
    
    private final SettingDeviceService appService;

    @GetMapping("/setting/device/get")
    public ResponseEntity<BaseResponse> getSettingDevice(@Valid @RequestMappingObject SettingDeviceGetReqDto reqDto) {
        return ResponseEntity.ok(BaseResponse.builder().data(appService.getSettingDevice(reqDto)).build());
    }
}
